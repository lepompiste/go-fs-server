package server

import (
	"net/http"
	"strconv"

	"github.com/julienschmidt/httprouter"
	"golang.org/x/crypto/bcrypt"
)

func (s *server) userAdd(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	username := r.FormValue("username")
	password := r.FormValue("password")
	privilege := r.FormValue("privilege")

	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	user, _ := s.getUser(login)

	if user.Privilege != 1 {
		errorResponse(w, "you do not have the right")
		return
	}

	if username != "" && password != "" && privilege != "" {
		_p, errConv := strconv.Atoi(privilege)
		if errConv != nil {
			errorResponse(w, "invalid privilege number")
			return
		}

		hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
		_, errExec := s.db.Exec("INSERT INTO users (login, password, privilege) VALUES (?, ?, ?)", username, hash, _p)

		if errExec != nil {
			errorResponse(w, "invalid user")
			return
		}

		successResponse(w, BaseAPIResponse{Status: "success"})
	} else {
		errorResponse(w, "not enough arguments")
	}
}

func (s *server) userDel(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	username := r.FormValue("username")

	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	user, _ := s.getUser(login)

	if user.Privilege != 1 {
		errorResponse(w, "you do not have the right")
		return
	}

	if username != "" {
		s.db.Exec("DELETE FROM users WHERE login = ?", username)
		s.db.Exec("DELETE FROM sessions WHERE login = ?", username)
		successResponse(w, BaseAPIResponse{Status: "success"})
		return
	}
	errorResponse(w, "not enough arguments")
}

// UsersListResponse represent a list of user, in a response
type UsersListResponse struct {
	BaseAPIResponse
	Users []User `json:"users"`
}

func (s *server) userList(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")

	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	user, _ := s.getUser(login)

	if user.Privilege != 1 {
		errorResponse(w, "you do not have the right")
		return
	}

	users, err := s.db.Query("SELECT login, privilege FROM users")

	if err != nil {
		errorResponse(w, err.Error())
		return
	}

	resp := UsersListResponse{}
	resp.Status = "success"
	resp.Users = make([]User, 0)
	var loginResult string
	var privilegeResult int64

	for users.Next() {
		errQuery := users.Scan(&loginResult, &privilegeResult)

		if errQuery != nil {
			errorResponse(w, errQuery.Error())
			return
		}

		resp.Users = append(resp.Users, User{loginResult, int(privilegeResult)})
	}

	successResponse(w, resp)
	return
}

func (s *server) userMod(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	username := r.FormValue("username")
	password := r.FormValue("password")
	privilege := r.FormValue("privilege")

	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}
	user, _ := s.getUser(login)

	if username != "" {
		if user.Privilege == 1 {
			if privilege != "" {
				_p, errConv := strconv.Atoi(privilege)
				if errConv != nil {
					errorResponse(w, "invalid privilege number")
					return
				}
				s.db.Exec("UPDATE users SET privilege = ? WHERE login = ?", _p, username)
			}
			if password != "" {
				hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
				s.db.Exec("UPDATE users SET password = ? WHERE login = ?", hash, username)

			}
			successResponse(w, BaseAPIResponse{Status: "success"})
		} else {
			if username == login {
				if privilege != "" {
					errorResponse(w, "You don't have right to change your privilege")
					return
				}
				if password != "" {
					hash, _ := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
					s.db.Exec("UPDATE users SET password = ? WHERE login = ?", hash, username)
				}
				successResponse(w, BaseAPIResponse{Status: "success"})
			} else {
				errorResponse(w, "you have no right on other users")
				return
			}
		}
	} else {
		errorResponse(w, "You have to specify the username")
		return
	}

}

type loginResponse struct {
	BaseAPIResponse
	Auth
}

func (s *server) userLogin(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	password := r.FormValue("password")
	auth := s.checkAuth(login, password)

	w.Header().Set("Content-Type", "application/json")

	if auth == nil {
		errorResponse(w, "no match login/password")
		return
	}

	resp := loginResponse{}
	resp.Status = "success"
	resp.Auth = *auth
	successResponse(w, resp)
}

func (s *server) userLogout(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")

	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	s.logout(login, token)
	successResponse(w, BaseAPIResponse{Status: "success"})
}

type testSession struct {
	BaseAPIResponse
	Auth
}

func (s *server) sessionTest(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")

	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	resp := testSession{}
	resp.Status = "success"
	resp.Message = "successfully got the connection"
	auth, _ := s.getAuth(login, token)

	resp.Login = auth.Login
	resp.Token = auth.Token
	resp.Privilege = auth.Privilege
	resp.Expires = auth.Expires

	successResponse(w, resp)
}
