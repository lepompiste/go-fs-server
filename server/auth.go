package server

import (
	"time"
	"log"
)

type User struct {
	Login string
	Privilege int
}

// checkSession return true if login and sessionId matches, and if session is not expired
// delete all expired sessions
func checkSession(login, sessionId string) bool {
	DB.Exec("DELETE FROM sessions WHERE expires < ?", time.Now().Unix())
	rows, err := DB.Query("SELECT * FROM sessions WHERE login = ? AND sid = ?", login, sessionId)
	if err != nil {
		log.Fatal(err)
	}
	for rows.Next() {
		return true
	}
	return false
}

func getUser(login string) (*User, bool) {
	row := DB.QueryRow("SELECT login, privilege FROM users WHERE login = ?", login)
	resp := User{}
	err := row.Scan(&resp.Login, &resp.Privilege)
	if err != nil {
		return nil, false
	} else {
		return &resp, true
	}
}