package server

import (
	"io"
	"io/ioutil"
	"net/http"
	"os"
	"strings"

	"github.com/julienschmidt/httprouter"
)

const (
	// MAXUPLOAD Maximum size of uploaded files
	MAXUPLOAD = 20000000000
)

// DirEntry represents file or directory
type DirEntry struct {
	Name  string `json:"name"`
	IsDir bool   `json:"isDir"`
}

// LsResponse represents direcory listing response
type LsResponse struct {
	BaseAPIResponse
	Path      string     `json:"path"`
	Directory []DirEntry `json:"directory"`
}

func verifyPath(path string, w http.ResponseWriter) bool {
	parts := strings.Split(path, "/")
	for _, part := range parts {
		if part == ".." || part == "." {
			errorResponse(w, "Forbidden use of .. or .")
			return false
		}
	}
	return true
}

func (s *server) ls(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	path := r.FormValue("path")
	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(path, w) {
		return
	}

	files, err := ioutil.ReadDir("." + path)

	if err != nil {
		errorResponse(w, err.Error())
	} else {
		resp := LsResponse{Path: path, Directory: []DirEntry{}}
		resp.Status = "success"
		for _, file := range files {
			resp.Directory = append(resp.Directory, DirEntry{Name: file.Name(), IsDir: file.IsDir()})
		}

		successResponse(w, resp)
	}

}

func (s *server) rm(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	path := r.FormValue("path")
	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(path, w) {
		return
	}

	err := os.RemoveAll("." + path)

	if err != nil {
		errorResponse(w, err.Error())
		return
	}
	successResponse(w, BaseAPIResponse{Status: "success"})
}

func (s *server) upload(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	errMultipartForm := r.ParseMultipartForm(MAXUPLOAD)

	w.Header().Set("Content-Type", "application/json")

	if errMultipartForm != nil {
		errorResponse(w, errMultipartForm.Error())
		return
	}

	login := r.FormValue("login")
	token := r.FormValue("token")
	path := r.FormValue("path")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(path, w) {
		return
	}

	files := r.MultipartForm.File["uploads"]

	for i := range files { // loop through the files one by one
		file, errFile := files[i].Open()
		defer file.Close()

		if errFile != nil {
			errorResponse(w, errFile.Error())
			return
		}

		out, errOut := os.Create("." + path + "/" + files[i].Filename)
		defer out.Close()

		if errOut != nil {
			errorResponse(w, errOut.Error())
			return
		}

		_, errCopy := io.Copy(out, file)

		if errCopy != nil {
			errorResponse(w, errCopy.Error())
			return
		}
	}

	successResponse(w, BaseAPIResponse{Status: "success"})
}

type catResponse struct {
	BaseAPIResponse
	Content string `json:"content"`
}

func (s *server) cat(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	path := r.FormValue("path")
	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(path, w) {
		return
	}

	dat, err := ioutil.ReadFile("." + path)

	if err != nil {
		errorResponse(w, err.Error())
		return
	}

	resp := catResponse{}
	resp.Status = "success"
	resp.Content = string(dat)

	successResponse(w, resp)
}

func (s *server) mkdir(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	path := r.FormValue("path")
	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(path, w) {
		return
	}

	err := os.MkdirAll("."+path, os.ModePerm)

	if err != nil {
		errorResponse(w, err.Error())
		return
	}

	resp := BaseAPIResponse{Status: "success"}
	successResponse(w, resp)
}

func (s *server) touch(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	path := r.FormValue("path")
	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(path, w) {
		return
	}

	file, err := os.OpenFile("."+path, os.O_CREATE, os.ModePerm)
	defer file.Close()

	if err != nil {
		errorResponse(w, err.Error())
		return
	}

	resp := BaseAPIResponse{Status: "success"}
	successResponse(w, resp)
}

func (s *server) echo(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	path := r.FormValue("path")
	content := r.FormValue("content")
	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(path, w) {
		return
	}

	err := ioutil.WriteFile("."+path, []byte(content), os.ModePerm)

	if err != nil {
		errorResponse(w, err.Error())
		return
	}

	resp := BaseAPIResponse{Status: "success"}
	successResponse(w, resp)
}
