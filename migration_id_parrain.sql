-- ============================================================================
-- MIGRATION : Correction de id_parrain dans les tables parrainage et paiement
-- Date : 2025-11-17
-- Description : 
--   ÉTAPE 1 : Remplir id_parrain dans la table parrainage
--   ÉTAPE 2 : Mettre à jour id_parrain dans la table paiement depuis parrainage
-- ============================================================================

-- ============================================================================
-- ÉTAPE 1 : DIAGNOSTIC - Identifier les parrainages qui ont besoin d'id_parrain
-- ============================================================================

-- Voir les parrainages qui ont des paiements mais pas d'id_parrain
SELECT 
    parr.id AS id_parrainage,
    parr.id_jeune,
    parr.id_formation,
    parr.id_parrain AS id_parrain_actuel,
    p.id AS id_paiement,
    p.reference,
    p.date,
    p.montant,
    p.status
FROM parrainage parr
INNER JOIN paiement p ON p.id_parrainage = parr.id
WHERE parr.id_parrain IS NULL
ORDER BY p.date DESC;

-- ============================================================================
-- ÉTAPE 1 : CORRECTION - Remplir id_parrain dans la table parrainage
-- ============================================================================
-- IMPORTANT : Vous devez déterminer quel parrain correspond à quel parrainage
-- en fonction de votre logique métier (notifications, demandes, etc.)
-- 
-- Exemples de mise à jour (À ADAPTER selon vos données réelles) :

-- Exemple 1 : Mettre à jour un parrainage spécifique
-- UPDATE parrainage 
-- SET id_parrain = [ID_DU_PARRAIN]  -- ← Remplacer par l'ID réel du parrain
-- WHERE id = [ID_PARRAINAGE]  -- ← Remplacer par l'ID du parrainage
--   AND id_parrain IS NULL;

-- Exemple 2 : Mettre à jour plusieurs parrainages (les 3 derniers avec paiements)
-- UPDATE parrainage parr
-- INNER JOIN paiement p ON p.id_parrainage = parr.id
-- SET parr.id_parrain = [ID_DU_PARRAIN]  -- ← Remplacer par l'ID réel du parrain
-- WHERE parr.id IN (
--     SELECT DISTINCT p2.id_parrainage 
--     FROM paiement p2 
--     WHERE p2.id_parrainage IS NOT NULL 
--     ORDER BY p2.date DESC 
--     LIMIT 3
-- )
-- AND parr.id_parrain IS NULL;

-- Exemple 3 : Si vous avez une table de notifications ou demandes de parrainage
-- UPDATE parrainage parr
-- INNER JOIN [table_demandes_parrainage] dp ON dp.id_parrainage = parr.id
-- SET parr.id_parrain = dp.id_parrain
-- WHERE parr.id_parrain IS NULL
--   AND dp.id_parrain IS NOT NULL;

-- ============================================================================
-- ÉTAPE 1 : VÉRIFICATION - Vérifier que id_parrain a été rempli dans parrainage
-- ============================================================================

SELECT 
    parr.id AS id_parrainage,
    parr.id_jeune,
    parr.id_formation,
    parr.id_parrain,
    CASE 
        WHEN parr.id_parrain IS NULL THEN '❌ MANQUANT'
        ELSE '✅ OK'
    END AS statut
FROM parrainage parr
INNER JOIN paiement p ON p.id_parrainage = parr.id
ORDER BY p.date DESC;

-- ============================================================================
-- ÉTAPE 2 : CORRECTION - Mettre à jour id_parrain dans la table paiement
-- ============================================================================

-- Mettre à jour id_parrain dans paiement depuis parrainage
UPDATE paiement p
INNER JOIN parrainage parr ON parr.id = p.id_parrainage
SET p.id_parrain = parr.id_parrain
WHERE p.id_parrainage IS NOT NULL 
  AND p.id_parrain IS NULL
  AND parr.id_parrain IS NOT NULL;

-- ============================================================================
-- ÉTAPE 2 : VÉRIFICATION - Vérifier que id_parrain a été rempli dans paiement
-- ============================================================================

SELECT 
    p.id AS id_paiement,
    p.reference,
    p.date,
    p.montant,
    p.status,
    p.id_parrainage,
    p.id_parrain AS id_parrain_paiement,
    parr.id_parrain AS id_parrain_parrainage,
    CASE 
        WHEN p.id_parrain IS NULL AND p.id_parrainage IS NOT NULL THEN '❌ MANQUANT'
        WHEN p.id_parrain IS NOT NULL THEN '✅ OK'
        ELSE 'ℹ️ Paiement direct (pas de parrainage)'
    END AS statut
FROM paiement p
LEFT JOIN parrainage parr ON parr.id = p.id_parrainage
ORDER BY p.date DESC;

-- ============================================================================
-- VÉRIFICATION FINALE - Résumé des corrections
-- ============================================================================

-- Compter les paiements avec parrainage mais sans id_parrain
SELECT 
    COUNT(*) AS paiements_sans_parrain,
    'Paiements avec parrainage mais id_parrain NULL' AS description
FROM paiement p
INNER JOIN parrainage parr ON parr.id = p.id_parrainage
WHERE p.id_parrain IS NULL
  AND parr.id_parrain IS NOT NULL;

-- Compter les paiements avec id_parrain correctement rempli
SELECT 
    COUNT(*) AS paiements_avec_parrain,
    'Paiements avec id_parrain correctement rempli' AS description
FROM paiement p
WHERE p.id_parrain IS NOT NULL;

-- ============================================================================
-- NOTES IMPORTANTES
-- ============================================================================
-- 1. Avant d'exécuter les UPDATE, faites une SAUVEGARDE de votre base de données
-- 2. Pour l'ÉTAPE 1, vous devez déterminer manuellement quel parrain correspond 
--    à quel parrainage selon votre logique métier
-- 3. Les exemples d'UPDATE sont à ADAPTER selon vos données réelles
-- 4. Exécutez d'abord les requêtes de DIAGNOSTIC pour voir l'état actuel
-- 5. Exécutez les UPDATE un par un et vérifiez les résultats
-- 6. Utilisez les requêtes de VÉRIFICATION pour confirmer que tout est correct

