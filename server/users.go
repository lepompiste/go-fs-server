package server

import (
	"net/http"
	"github.com/julienschmidt/httprouter"
	"encoding/json"
	"fmt"
)

type Auth struct {
	Login string `json:"login"`
	Token string `json:"token"`
	Privilege int `json:"privilege"`	
}

func userAdd(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	/*token := r.URL.Query().Get("token")
	username := r.URL.Query().Get("username")
	password := r.URL.Query().Get("password")
	privilege := r.URL.Query().Get("privilege")*/
}

func userDel(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	/*token := r.URL.Query().Get("token")
	username := r.URL.Query().Get("username")*/
}

func userMod(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	/*token := r.URL.Query().Get("token")
	username := r.URL.Query().Get("username")*/
}

func userLogin(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	/*username := r.URL.Query().Get("username")
	password := r.URL.Query().Get("password")*/
}

func userLogout(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	//token := r.URL.Query().Get("token")
}

type TestSession struct {
	BaseApiResponse
	Auth
}

func sessionTest(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.URL.Query().Get("login")
	token := r.URL.Query().Get("token")

	resp := TestSession{}
	
	if checkSession(login, token) {
		resp.Status = "success"
		resp.Message = "successfully got the connection"
		usr, _ := getUser(login)
		resp.Login = usr.Login
		resp.Token = token
		resp.Privilege = usr.Privilege
	} else {
		resp.Status = "error"
	}
	bytes, _ := json.Marshal(resp)
	fmt.Fprint(w, string(bytes))
}