package server

import (
	"os"
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"golang.org/x/crypto/bcrypt"
)

// Exists return true if a file (given by name = path) exists, false else
func Exists(name string) bool {
    if _, err := os.Stat(name); err != nil {
        if os.IsNotExist(err) {
            return false
        }
    }
    return true
}

// initInstall create or load necessarily files
func initInstall(dbp string) {
	if !Exists(dbp + "/fs-server.db") {
		fmt.Println("No configuration detected, installing new one. Username will be admin, and password will be admin. It is recommended to change it on first connection.")
		db, errSQLOpen := sql.Open("sqlite3", dbp + "/fs-server.db") // Database creation

		if errSQLOpen != nil {
			fmt.Println("Error initializing database")
			os.Exit(-1)
		} else {
			DB = db
			DB.Exec("CREATE TABLE IF NOT EXISTS users (login TEXT PRIMARY KEY UNIQUE, password TEXT, privilege INTEGER)") // users table creation
			admin_hash, _ := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost) // hashing admin password
			DB.Exec("INSERT INTO users (login, password, privilege) VALUES (?, ?, ?)", "admin", admin_hash, 1) // creating first admin user
			DB.Exec("CREATE TABLE IF NOT EXISTS sessions (sid TEXT PRIMARY KEY UNIQUE, login TEXT, expires INTEGER)") // sessions table creation
			
		}
	} else {
		db, errSQLOpen := sql.Open("sqlite3", dbp + "/fs-server.db")
		if errSQLOpen != nil {
			fmt.Println("Error initializing database")
			os.Exit(-1)
		} else {
			DB = db
		}
	}
}