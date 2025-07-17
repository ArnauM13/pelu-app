#!/bin/bash

# Script per desplegar les regles de Firestore
# Requereix Firebase CLI instal·lat

echo "🚀 Desplegant regles de Firestore..."

# Verificar si Firebase CLI està instal·lat
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI no està instal·lat. Instal·la'l amb: npm install -g firebase-tools"
    exit 1
fi

# Verificar si els fitxers de configuració existeixen
if [ ! -f "firebase.json" ]; then
    echo "❌ No es troba firebase.json. Verifica que estàs al directori correcte."
    exit 1
fi

if [ ! -f ".firebaserc" ]; then
    echo "❌ No es troba .firebaserc. Verifica la configuració del projecte."
    exit 1
fi

# Verificar si estàs autenticat
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Inicia sessió a Firebase..."
    firebase login
fi

# Verificar que estàs al projecte correcte
echo "🔍 Verificant configuració del projecte..."
firebase use

# Desplegar les regles
echo "📝 Desplegant regles de seguretat..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
echo "✅ Regles de Firestore desplegades amb èxit!"
echo "🔒 Les regles de seguretat estan ara actives al teu projecte Firebase."
else
    echo "❌ Error al desplegar les regles de Firestore."
    exit 1
fi
