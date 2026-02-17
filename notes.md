# Flask sub commands
## Flask-Migrate
flask db init
- initialize the migration repository for the app

flask db migrate -m "users table"
- does not make the changes to the database, it just generates the migration script

flask db upgrade
- applies the changes to the database
- When working with database servers such as MySQL and PostgreSQL, you have to create the database in the database server before running upgrade.
- If you prefer to choose your own table names, you can add an attribute named ``__tablename__`` to the model class, set to the desired name as a string.

flask db downgrade base
- Tells Flask-Migrate to apply the database migrations in reverse order. When the downgrade command is not given a target, it downgrades one revision. The base target causes all migrations to be downgraded, until the database id left at its initial state, with no tables.

flask db upgrade
- The upgrade command re-applies all the migrations in forward order. The default target for upgrades is head, which is a shortcut for the most recent migration. This command effectively restores the tables that were downgraded above. Since database migrations do not preserve the data stored in the database, downgrading and then upgrading has the effect of quickly emptying all the tables.

## flask shell
- The `shell` command is the second core command implemented by Flask, after `run`.
- The purpose of this command is to start a Python interpreter in the context of the application.
