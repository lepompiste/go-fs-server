package server

import (
	"time"
	"log"
	"fmt"
	"os"
	"database/sql"
)

type User struct {
	Login string
	Privilege int
}

// checkSession return true if login and sessionId matches, and if session is not expired
// delete all expired sessions
func checkSession(login, sessionId string) bool {
	/*db, errSQLOpen := sql.Open("sqlite3", DBPATH + "/fs-server.db")
	defer db.Close()
	if errSQLOpen != nil {
		fmt.Println("Error initializing database")
		os.Exit(-1)
	}*/

	_db.Exec("DELETE FROM sessions WHERE expires < ?", time.Now().Unix())
	rows, err := _db.Query("SELECT * FROM sessions WHERE login = ? AND sid = ?", login, sessionId)
	if err != nil {
		log.Fatal(err)
	}
	var res bool = false
	for rows.Next() {
		res = true
	}
	rows.Close()
	var new_tmstmp int = int(time.Now().Add(2 * time.Hour).Unix())
	_db.Exec("UPDATE sessions SET expires = ? WHERE sid = ?", new_tmstmp, sessionId)// TOFIX
	return res
}

func getUser(login string) (*User, bool) {
	db, errSQLOpen := sql.Open("sqlite3", DBPATH + "/fs-server.db")
	defer db.Close()
	if errSQLOpen != nil {
		fmt.Println("Error initializing database")
		os.Exit(-1)
	}

	row := db.QueryRow("SELECT login, privilege FROM users WHERE login = ?", login)
	resp := User{}
	err := row.Scan(&resp.Login, &resp.Privilege)
	if err != nil {
		return nil, false
	} else {
		return &resp, true
	}
}

func logout(sid string) {
	db, errSQLOpen := sql.Open("sqlite3", DBPATH + "/fs-server.db")
	defer db.Close()
	if errSQLOpen != nil {
		fmt.Println("Error initializing database")
		os.Exit(-1)
	}

	db.Exec("DELETE FROM sessions WHERE sid = ?", sid)
}