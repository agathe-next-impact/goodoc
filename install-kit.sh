#!/usr/bin/env bash
# install-kit.sh — Installe le kit Claude Code universel.
#
# Ce kit s'applique à tout projet web TypeScript moderne existant. Mode legacy-friendly
# par défaut (audit scoped au diff, Boy Scout Rule, dette trackée).
#
# Usage :
#   ./install-kit.sh [target-dir]

set -euo pipefail

TARGET="${1:-$(pwd)}"
SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "📦 Kit Claude Code — universel (projet existant)"
echo "   Source : $SOURCE_DIR"
echo "   Cible  : $TARGET"
echo ""
echo "ℹ️  Ce kit est conçu pour :"
echo "   - S'appliquer à TOUT projet web TypeScript moderne"
echo "   - Mode legacy-friendly par défaut (scope au diff, dette trackée)"
echo "   - Fondation pour ajouter des overlays stack-spécifiques plus tard"
echo ""

if [ ! -d "$TARGET" ]; then
  echo "❌ Le dossier cible n'existe pas : $TARGET"
  exit 1
fi

for required in ".claude/agents" ".claude/commands" "CLAUDE.md"; do
  if [ ! -e "$SOURCE_DIR/$required" ]; then
    echo "❌ Kit source incomplet : manque $required"
    exit 1
  fi
done

copy_with_check() {
  local src="$1"
  local dest="$2"
  if [ -e "$dest" ]; then
    read -p "⚠️  $dest existe déjà. Écraser ? [y/N] " answer
    if [[ ! "$answer" =~ ^[Yy]$ ]]; then
      echo "   → Conservé : $dest"
      return
    fi
  fi
  cp -r "$src" "$dest"
  echo "   ✓ Installé : $dest"
}

# Copier CLAUDE.md
copy_with_check "$SOURCE_DIR/CLAUDE.md" "$TARGET/CLAUDE.md"

# Copier .claude/
mkdir -p "$TARGET/.claude"
copy_with_check "$SOURCE_DIR/.claude/agents" "$TARGET/.claude/agents"
copy_with_check "$SOURCE_DIR/.claude/commands" "$TARGET/.claude/commands"

# Créer structure /docs
mkdir -p "$TARGET/docs/audits"
mkdir -p "$TARGET/docs/ops"
mkdir -p "$TARGET/docs/testing"
mkdir -p "$TARGET/docs/releases"
mkdir -p "$TARGET/docs/security"
mkdir -p "$TARGET/docs/design-system"
echo "   ✓ Créé : $TARGET/docs/ (arborescence pour livrables des agents)"

# Initialiser tech-debt.md si absent
if [ ! -f "$TARGET/docs/tech-debt.md" ]; then
  cat > "$TARGET/docs/tech-debt.md" <<'EOF'
# Dette technique

> Sévérité : CRITICAL (< 1 semaine) | HIGH (trimestre) | MED (au fil de l'eau) | LOW (opportuniste)
> Maintenu par l'agent `tech-debt-tracker`. Ajouts manuels OK aussi.

## Critical
_(aucune)_

## High
_(aucune)_

## Medium
_(aucune)_

## Low
_(aucune)_

## Resolved (archive 30 jours avant suppression)
EOF
  echo "   ✓ Créé : $TARGET/docs/tech-debt.md"
fi

# Initialiser overlays.md
if [ ! -f "$TARGET/docs/overlays.md" ]; then
  cat > "$TARGET/docs/overlays.md" <<'EOF'
# Overlays appliqués

> Ce kit est universel. Aucun overlay stack-spécifique n'est appliqué pour le moment.
>
> Overlays disponibles (à créer / installer séparément selon besoins) :
> - `nextjs-payload` — Next.js + Payload + Stripe + Mapbox
> - `astro-payload` — Astro + Payload headless
> - `wp-nextjs` — WordPress Headless + Next.js
> - `medsite-saas` — Multi-tenant + RGPD santé + HDS
> - `payload-legacy` — Mode diff-scoped pour projet Payload existant

## Appliqués
_(aucun)_

## Historique d'application
_(aucun)_
EOF
  echo "   ✓ Créé : $TARGET/docs/overlays.md"
fi

# Runbook vide mais présent
if [ ! -f "$TARGET/docs/ops/runbook.md" ]; then
  cat > "$TARGET/docs/ops/runbook.md" <<'EOF'
# Runbook opérationnel

> À remplir lors de la première session `/onboard` ou au premier incident.

## Comment redémarrer l'app ?
_(à remplir selon hosting)_

## Comment rollback un déploiement ?
_(à remplir selon hosting)_

## Comment lire les logs en prod ?
_(à remplir)_

## Comment restore la DB depuis un backup ?
_(à remplir)_

## Contacts d'urgence
_(à remplir)_
EOF
  echo "   ✓ Créé : $TARGET/docs/ops/runbook.md (template)"
fi

# .gitignore : ajouter settings.local.json
GITIGNORE="$TARGET/.gitignore"
if [ -f "$GITIGNORE" ] && ! grep -q "^\.claude/settings\.local\.json" "$GITIGNORE"; then
  echo "" >> "$GITIGNORE"
  echo "# Claude Code — paramètres locaux non partagés" >> "$GITIGNORE"
  echo ".claude/settings.local.json" >> "$GITIGNORE"
  echo "   ✓ Ajouté à .gitignore : .claude/settings.local.json"
fi

echo ""
echo "✅ Kit universel installé."
echo ""
echo "📋 Prochaines étapes OBLIGATOIRES :"
echo ""
echo "  1. cd $TARGET"
echo ""
echo "  2. Lancer Claude Code : claude"
echo ""
echo "  3. Taper la commande : /onboard"
echo "     → Claude explore le repo, découvre la stack, et remplit les"
echo "       sections <À REMPLIR> de CLAUDE.md automatiquement."
echo ""
echo "  4. Relire CLAUDE.md et ajuster si besoin."
echo ""
echo "  5. Selon la stack détectée, Claude suggérera un overlay."
echo "     Les overlays n'existent pas encore dans ce repo source —"
echo "     tu peux rester en universel, ou extraire un overlay depuis"
echo "     les kits dédiés (wp-nextjs, payload, astro-payload, medsite)."
echo ""
echo "📖 Documentation :"
echo "   USAGE.md              — guide d'usage du kit"
echo "   BOOTSTRAP_PROMPT.md   — prompts prêts à coller"
echo "   CLAUDE.md             — contexte projet (à compléter via /onboard)"
echo ""
echo "💡 Philosophie du kit :"
echo "   - Audit scoped au diff par défaut — Claude ne scan pas tout le repo"
echo "     sauf demande explicite via /audit-global."
echo "   - Boy Scout Rule — améliorer localement ce qui est touché,"
echo "     ne pas imposer de refacto massive."
echo "   - Critical findings signalés même hors scope."
echo "   - Dette technique documentée, jamais forcée."
