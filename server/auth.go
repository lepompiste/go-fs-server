package server

import (
	"log"
	"math/rand"
	"net/http"
	"time"

	"golang.org/x/crypto/bcrypt"
)

// User represent user
type User struct {
	Login     string `json:"login"`
	Privilege int    `json:"privilege"`
}

// Auth basic auth representation
type Auth struct {
	User
	Token   string `json:"token"`
	Expires int    `json:"expires"`
}

// RandStringRunes generates random string of n runes among `among` runes
func RandStringRunes(n int, among string) string {
	letterRunes := []rune(among)
	b := make([]rune, n)
	for i := range b {
		b[i] = letterRunes[rand.Intn(len(letterRunes))]
	}
	return string(b)
}

// makeSession generate token and register new session into the database
func (s *server) makeSession(login string) (token string, expires int) {
	token = RandStringRunes(64, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
	expires = int(time.Now().Add(2 * time.Hour).Unix())

	s.db.Exec("INSERT INTO sessions (login, token, expires) VALUES (?, ?, ?)", login, token, expires)

	return
}

// checkAuth check for login and password and return the Auth infos if login/password match, nil else
func (s *server) checkAuth(login, password string) *Auth {
	var _login, _pwHash string
	var _privilege int64
	s.db.Exec("DELETE FROM sessions WHERE expires < ?", time.Now().Unix())
	row := s.db.QueryRow("SELECT login, password, privilege FROM users WHERE login = ?", login)
	err := row.Scan(&_login, &_pwHash, &_privilege)

	if err != nil {
		return nil // No user named login
	}

	errPw := bcrypt.CompareHashAndPassword([]byte(_pwHash), []byte(password))
	if errPw != nil {
		return nil
	}

	var authInfos Auth
	authInfos.Login = _login
	authInfos.Privilege = int(_privilege)

	_token, _expires := s.makeSession(_login)

	authInfos.Token = _token
	authInfos.Expires = _expires

	return &authInfos
}

// checkSession return true if login and sessionId matches, and if session is not expired
// delete all expired sessions
func (s *server) checkSession(login, token string) bool {
	s.db.Exec("DELETE FROM sessions WHERE expires < ?", time.Now().Unix())
	rows, err := s.db.Query("SELECT * FROM sessions WHERE login = ? AND token = ?", login, token)
	if err != nil {
		log.Fatal(err)
	}
	var res bool = false
	for rows.Next() {
		res = true
	}
	rows.Close()
	var newTmstmp int = int(time.Now().Add(2 * time.Hour).Unix())
	s.db.Exec("UPDATE sessions SET expires = ? WHERE token = ?", newTmstmp, token)
	return res
}

// getUser is used to get user infos /!\ use it after checking the user is properly logged in
func (s *server) getUser(login string) (*User, bool) {
	row := s.db.QueryRow("SELECT login, privilege FROM users WHERE login = ?", login)
	resp := User{}
	err := row.Scan(&resp.Login, &resp.Privilege)
	if err != nil {
		return nil, false
	}
	return &resp, true
}

// getUser is used to get auth infos. It provides more info than getUser, for example token and expiration or session
func (s *server) getAuth(login, token string) (*Auth, bool) {
	rowUser := s.db.QueryRow("SELECT login, privilege FROM users WHERE login = ?", login)
	resp := Auth{}
	err := rowUser.Scan(&resp.Login, &resp.Privilege)
	if err != nil {
		return nil, false
	}
	rowSession := s.db.QueryRow("SELECT token, expires FROM sessions WHERE login = ? AND token = ?", login, token)
	err = rowSession.Scan(&resp.Token, &resp.Expires)
	if err != nil {
		return nil, false
	}
	return &resp, true
}

// Delete the session of the user in database
func (s *server) logout(login, token string) {
	s.db.Exec("DELETE FROM sessions WHERE login = ? AND token = ?", login, token)
}

// logged is used to automatically respond when check is unsuccessful, and return if the session is valid or not.
// It is used in files and users api endpoint
func (s *server) logged(login, token string, w http.ResponseWriter) bool {
	if !s.checkSession(login, token) {
		errorResponse(w, "no valid login/token")
		return false
	}
	return true
}
