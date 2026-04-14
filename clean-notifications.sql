-- Script pour nettoyer les anciennes notifications
-- Exécutez ce script pour repartir sur une base propre

-- Marquer toutes les notifications existantes comme lues
UPDATE "Notification" SET "isRead" = true WHERE "isRead" = false;

-- OU supprimer complètement toutes les notifications (plus radical)
-- DELETE FROM "Notification";

-- Afficher le résultat
SELECT COUNT(*) as "Total notifications",
       SUM(CASE WHEN "isRead" = false THEN 1 ELSE 0 END) as "Non lues",
       SUM(CASE WHEN "kind" = 'MESSAGE' THEN 1 ELSE 0 END) as "Messages",
       SUM(CASE WHEN "kind" = 'SALE_MADE' THEN 1 ELSE 0 END) as "Ventes",
       SUM(CASE WHEN "kind" = 'INVOICE_RECEIVED' THEN 1 ELSE 0 END) as "Factures"
FROM "Notification";
