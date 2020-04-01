package server

import (
	"database/sql"
	"fmt"
	"os"
	"runtime"

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
	currentWD, _ := os.Getwd()
	var fullDBPath string
	if runtime.GOOS == "windows" {
		fmt.Println("Windows detected. Using database path as is.")
		fullDBPath = s.dbpath + "/fs-server.db"
	} else { // For a certain reason (that I ignore), on linux, and probably all unix, opening an existing database opens it on the wrong folder when using relative path. So we make it absolute here
		if s.dbpath[0] == '/' {
			fullDBPath = s.dbpath + "/fs-server.db"
		} else {
			fullDBPath = currentWD + "/" + s.dbpath + "/fs-server.db"
		}
		fmt.Println("Unix detected. Making database path absolute if not already. Database path is now :", fullDBPath)
	}

	if !Exists(s.dbpath + "/fs-server.db") {
		fmt.Println("No configuration detected, installing new one. Username will be admin, and password will be admin. It is recommended to change it on first connection.")
		db, errSQLOpen := sql.Open("sqlite3", fullDBPath) // Database creation

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
		db, errSQLOpen := sql.Open("sqlite3", fullDBPath)
		if errSQLOpen != nil {
			fmt.Println("Error initializing database")
			os.Exit(-1)
		} else {
			s.db = db
			s.db.SetMaxOpenConns(1)
		}
	}
}
