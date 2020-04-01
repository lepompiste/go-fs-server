package server

import (
	"database/sql"
	"fmt"
	"os"

	_ "github.com/mattn/go-sqlite3" // to use with sql
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
func (s *server) initInstall() {
	if !Exists(s.dbpath + "/fs-server.db") {
		fmt.Println(os.Getwd())
		fmt.Println(s.dbpath + "/fs-server.db")
		fmt.Println("No configuration detected, installing new one. Username will be admin, and password will be admin. It is recommended to change it on first connection.")
		db, errSQLOpen := sql.Open("sqlite3", s.dbpath+"/fs-server.db") // Database creation

		if errSQLOpen != nil {
			fmt.Println("Error initializing database")
			os.Exit(-1)
		} else {
			db.Exec("CREATE TABLE IF NOT EXISTS users (login TEXT PRIMARY KEY UNIQUE, password TEXT, privilege INTEGER)") // users table creation
			adminHash, _ := bcrypt.GenerateFromPassword([]byte("admin"), bcrypt.DefaultCost)                              // hashing admin password
			db.Exec("INSERT INTO users (login, password, privilege) VALUES (?, ?, ?)", "admin", adminHash, 1)             // creating first admin user
			db.Exec("CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY UNIQUE, login TEXT, expires INTEGER)")   // sessions table creation
			s.db = db
			s.db.SetMaxOpenConns(1)
		}
	} else {
		db, errSQLOpen := sql.Open("sqlite3", s.dbpath+"/fs-server.db")
		fmt.Println(os.Getwd())
		fmt.Println(s.dbpath + "/fs-server.db")
		if errSQLOpen != nil {
			fmt.Println("Error initializing database")
			os.Exit(-1)
		} else {
			s.db = db
			s.db.SetMaxOpenConns(1)
		}
	}
}
