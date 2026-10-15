#!/usr/bin/env python3
"""
Stock en direct du distributeur La Spéciale (SRPManager / Resto'Clock).

- Se connecte au back office srpmanager.fr avec SRP_USER / SRP_PASS (variables d'environnement)
- Récupère l'état des colonnes
- Règles :
    vert   (bargreen)             -> pizza bonne
    orange (baryellow / barblue)  -> périme dans les 24h, encore vendable
    rouge  (barred)               -> périmée : BLOQUE TOUTE LA COLONNE
- Écrit stock.json (lu par le site)
"""
import json
import os
import re
import sys
from datetime import datetime
from zoneinfo import ZoneInfo

import requests
from bs4 import BeautifulSoup

BASE = "https://www.srpmanager.fr"
TZ = ZoneInfo("Europe/Paris")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/129.0 Safari/537.36")


def fetch_fragment(user: str, password: str) -> str:
    s = requests.Session()
    s.headers.update({"User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9"})

    # 1. page de connexion -> jeton CSRF
    r = s.get(f"{BASE}/fr/login", timeout=30)
    r.raise_for_status()
    tok = BeautifulSoup(r.text, "html.parser").find("input", {"name": "_csrf_token"})
    if not tok:
        raise RuntimeError("Jeton CSRF introuvable sur la page de connexion")

    # 2. connexion
    r = s.post(f"{BASE}/fr/login_check", data={
        "_csrf_token": tok["value"],
        "_username": user,
        "_password": password,
        "_submit": "",
    }, timeout=30)
    r.raise_for_status()
    if "/login" in r.url:
        raise RuntimeError("Connexion refusée (identifiants ?)")

    # 3. état des machines (même appel que le tableau de bord)
    r = s.post(f"{BASE}/fr/machine/list%7D",
               headers={"X-Requested-With": "XMLHttpRequest"}, timeout=30)
    r.raise_for_status()
    html = r.json()["result"]

    s.get(f"{BASE}/fr/logout", timeout=15)  # on referme proprement
    return html


def parse(html: str) -> dict:
    soup = BeautifulSoup(html, "html.parser")
    pizzas = []
    for block in soup.select(".description-block"):
        h = block.select_one(".description-header")
        if not h:
            continue
        name = " ".join(h.get_text(" ", strip=True).split())
        green = orange = red = 0
        for slot in block.select(".emplacement"):
            cls = slot.get("class", [])
            if "qtycolonne" in cls:
                continue
            if "barred" in cls:
                red += 1
            elif "baryellow" in cls or "barblue" in cls:
                orange += 1
            elif "bargreen" in cls:
                green += 1
        blocked = red > 0
        pizzas.append({
            "nom": name,
            "dispo": 0 if blocked else green + orange,
            "bloquee": blocked,
            "vertes": green, "oranges": orange, "rouges": red,
        })

    m = re.search(r"Stock au\s*:\s*(\d{2}/\d{2}/\d{4} \d{2}:\d{2}:\d{2})", soup.get_text(" "))
    stock_au = m.group(1) if m else None
    porte = soup.select_one(".etat_porte .badge")
    return {
        "maj": datetime.now(TZ).strftime("%d/%m/%Y %H:%M"),
        "stock_machine": stock_au,
        "porte": porte.get_text(strip=True) if porte else None,
        "pizzas": pizzas,
        "total": sum(p["dispo"] for p in pizzas),
        "alertes": [f"Colonne {p['nom']} bloquée : {p['rouges']} périmée(s), "
                    f"{p['vertes'] + p['oranges']} pizza(s) invendable(s)"
                    for p in pizzas if p["bloquee"]],
    }


def main():
    if len(sys.argv) > 1:  # mode test : python srp_stock.py fragment.html
        html = open(sys.argv[1], encoding="utf-8").read()
    else:
        html = fetch_fragment(os.environ["SRP_USER"], os.environ["SRP_PASS"])
    data = parse(html)
    if not data["pizzas"]:
        raise RuntimeError("Aucune colonne trouvée : la page a peut-être changé")
    with open("stock.json", "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print(json.dumps(data, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
