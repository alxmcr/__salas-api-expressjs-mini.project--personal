# Salas: Backend

## MongoDB

- **Database name:** `reservas-salas`

**Backup**

```bash
$ mongodump --db reservas-salas --out ./_database/backup_yyyymmdd
```

**Restore**

```bash
$ mongorestore --db reservas-salas ./_database/backup_yyyymmdd/reservas-salas
```
