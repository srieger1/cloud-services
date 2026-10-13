{ pkgs, ... }:

{
  # marp-cli aus nixpkgs (bewährt wie im KP-Devenv), Chromium für PDF/PNG-Rendering
  packages = with pkgs; [
    marp-cli
    chromium
  ];

  # Node für Slidev (npx, siehe scripts.slidev)
  languages.javascript = {
    enable = true;
    package = pkgs.nodejs_22;
  };

  env = {
    # marp-cli nutzt Chromium über CHROME_PATH statt des gepuppeteerten Downloads
    CHROME_PATH = "${pkgs.chromium}/bin/chromium";
    PUPPETEER_SKIP_DOWNLOAD = "true";
    PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true";
  };

  # Slidev über npx — Cache landet in ~/.npm/_npx, damit kein node_modules
  # in das Nextcloud-synchronisierte Verzeichnis gelangt.
  # Präsentieren:   slidev <deck>.md          (öffnet Browser, Presenter-Modus: http://localhost:3030/presenter)
  # PDF-Export:     slidev export <deck>.md   (benötigt einmalig: npx playwright install chromium;
  #                                            unter NixOS ggf. fehlende System-Libs — im Zweifel
  #                                            die Folien als PDF über marp rendern)
  # Neues Deck:     slidev-new <verzeichnis>
  scripts.slidev.exec = "exec npx --yes --package @slidev/cli --package @slidev/theme-default slidev \"$@\"";
  scripts.slidev-new.exec = "exec npx --yes create-slidev \"$@\"";

  # Marp-Decks -> Slidev-Fassung in slidev/ (Marp bleibt kanonisch, siehe tools/to-slidev.mjs)
  scripts.slidev-convert.exec = ''
    exec node "$DEVENV_ROOT/tools/to-slidev.mjs" "$@"
  '';

  # Slidev-Fassung aller Decks erzeugen und als statische Site nach slidev/dist/<n>/ bauen
  scripts.slidev-build.exec = ''
    set -e
    cd "$DEVENV_ROOT"
    node tools/to-slidev.mjs "$@"
    cd slidev
    for f in [0-9][0-9]-*.md; do
      echo "==> slidev build $f"
      npx --yes --package @slidev/cli --package @slidev/theme-default \
        slidev build "$f" --base ./ --out "dist/''${f%.md}"
    done
  '';

  # Live-Vorschau: Marp-Decks beobachten und bei Änderung neu konvertieren; daneben läuft
  # der Slidev-Dev-Server (Hot-Reload). Ohne Argument wird das zuletzt geänderte Deck gezeigt,
  # Port 3030 (überschreibbar als zweites Argument).
  # Wichtig: Slidev weicht bei belegtem Port still auf 3031/3032 aus — dann schaut die offene
  # Browser-Registerkarte auf die alte Instanz und lädt nie neu. Deshalb prüfen wir den Port
  # vorher und brechen mit Hinweis ab.
  scripts.slidev-watch.exec = ''
    set -e
    cd "$DEVENV_ROOT"
    node tools/to-slidev.mjs >/dev/null
    deck="''${1:-$(ls -t [0-9][0-9]-*.md | head -1)}"
    port="''${2:-3030}"
    # Belegten Port familienneutral erkennen (Slidev lauscht je nach Auflösung auf [::1] oder
    # 127.0.0.1 — ein Test nur gegen IPv4 übersieht eine laufende Instanz).
    belegt=""
    if command -v ss >/dev/null 2>&1; then
      belegt=$(ss -ltn 2>/dev/null | awk -v p="$port" '$4 ~ (":" p "$") { print "ja"; exit }')
    fi
    if [ "$belegt" = "ja" ]; then
      echo "FEHLER: Port $port ist belegt — dort läuft noch eine ältere Slidev-Instanz."
      echo "  Finden:      pgrep -af '\\.bin/slidev'   (bzw. die Terminalfenster der alten Starts)"
      echo "  Beenden:     das alte Fenster mit Strg-C schließen, oder:  kill <PID>"
      echo "  Oder bewusst einen anderen Port wählen:  devenv shell -- slidev-watch $deck 3035"
      echo "  (Wichtig: dann im Browser die neue URL öffnen — eine alte Registerkarte lädt nie neu.)"
      exit 1
    fi
    echo "Präsentiere slidev/$deck — Änderungen an den Marp-Decks werden automatisch übernommen."
    echo "  Vorschau:  http://localhost:$port/   (diese URL im Browser öffnen; eine alte"
    echo "             slidev/dist-Registerkarte ist ein statischer Schnappschuss und lädt NIE neu)"
    echo "  Jede Speicherung erscheint hier als Zeile „[hh:mm:ss] Marp-Decks neu konvertiert“."
    (
      last=""
      while true; do
        state=$(stat -c %Y [0-9][0-9]-*.md | tr '\n' ' ')
        if [ "$state" != "$last" ]; then
          last="$state"
          node tools/to-slidev.mjs >/dev/null && echo "[$(date +%H:%M:%S)] Marp-Decks neu konvertiert"
        fi
        sleep 1
      done
    ) &
    watcher=$!
    trap 'kill $watcher 2>/dev/null || true' INT TERM EXIT
    cd slidev
    npx --yes --package @slidev/cli --package @slidev/theme-default slidev "$deck" --port "$port"
  '';

  # Überlaufmessung der gerenderten Slidev-Fassung (benötigt frisches slidev-build)
  scripts.slidevcheck.exec = ''
    exec node "$DEVENV_ROOT/tools/slidevcheck.mjs" "$@"
  '';

  # Alle Kapitel-Decks als PDF rendern (marp); Abbruch beim ersten Fehler
  scripts.pdfs.exec = ''
    set -e
    cd "$DEVENV_ROOT"
    for f in [0-9][0-9]-*.md; do
      echo "==> marp --pdf $f"
      marp --allow-local-files --pdf --output "''${f%.md}.pdf" "$f"
    done
  '';

  # Veröffentlichte Fassung lokal erzeugen (genau wie CI/GitHub Pages):
  # PDFs nach public/ rendern und die Übersichtsseite public/index.html schreiben.
  scripts.pages.exec = ''
    set -e
    cd "$DEVENV_ROOT"
    mkdir -p public
    for f in [0-9][0-9]-*.md; do
      echo "==> $f"
      marp --allow-local-files --pdf --output "public/''${f%.md}.pdf" "$f"
    done
    node tools/site.mjs public
    echo "Fertig — Vorschau z. B. mit: python3 -m http.server -d public 8080"
  '';

  # Nur die Übersichtsseite aus vorhandenen PDFs erzeugen (public/index.html)
  scripts.site.exec = ''
    exec node "$DEVENV_ROOT/tools/site.mjs" "$@"
  '';

  # DoD-Prüfung: Folien-Dichte, Marker-Konvention, Abschlussfolien (PLANNED-CHANGES.md Abschnitt 0/8)
  scripts.slidecheck.exec = ''
    exec node "$DEVENV_ROOT/tools/slidecheck.mjs" "$@"
  '';

  # Link-Check über alle Decks (und optional Lab-Sheets); 403/405/401 gelten als "prüfen", nicht als tot
  scripts.linkcheck.exec = ''
    exec node "$DEVENV_ROOT/tools/linkcheck.mjs" "$@"
  '';

  # Beides zusammen — vor jedem Semesterstart bzw. vor dem Commit einer Phase.
  # Beide Exit-Codes werden gesammelt; der erste Verstoß bestimmt den Exit-Code (CI-tauglich).
  scripts.check.exec = ''
    cd "$DEVENV_ROOT"
    rc=0
    node tools/slidecheck.mjs "$@" || rc=$?
    node tools/linkcheck.mjs "$@" || rc=$?
    exit $rc
  '';

  enterShell = ''
    echo "Cloud Services · marp $(marp --version) · node $(node --version)"
    echo "  Decks: 00-Gliederung … 06-Backup-Recovery, 10-Lab1-Docker … 16-Lab7-Referenzprojekt-Ausblick, 20-Flipped-Classroom-Auftrag"
    echo "  pdfs         — alle Decks ([0-9][0-9]-*.md) als PDF rendern"
    echo "  pages        — veröffentlichte Fassung lokal bauen: public/*.pdf + public/index.html"
    echo "  site         — nur die Übersichtsseite aus vorhandenen PDFs erzeugen"
    echo "  slidecheck   — Folien-Dichte/Marker gegen die DoD aus PLANNED-CHANGES.md prüfen"
    echo "  linkcheck    — alle Links der Decks prüfen"
    echo "  check        — slidecheck + linkcheck (Exit-Code != 0 bei Verstoß)"
    echo "  slidev <deck>.md — Präsentieren (Presenter-Modus)"
    echo "  slidev-convert   — Marp-Decks nach slidev/ übersetzen (Marp bleibt kanonisch)"
    echo "  slidev-build     — Slidev-Fassung erzeugen und nach slidev/dist/ bauen"
    echo "  slidev-watch [deck.md] — live: Marp-Änderung -> Slidev-Vorschau (Hot-Reload)"
    echo "  slidevcheck      — gerenderte Slidev-Folien auf Überlauf prüfen (Exit 1)"
  '';
}
