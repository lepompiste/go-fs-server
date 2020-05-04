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
	MAXUPLOAD = 128 * 1000 * 1000 // 128MB
)

// DirEntry represents file or directory
type DirEntry struct {
	Name  string `json:"name"`
	IsDir bool   `json:"isDir"`
	Size  int64  `json:"size"`
}

// LsResponse represents direcory listing response
type LsResponse struct {
	BaseAPIResponse
	Path      string     `json:"path"`
	Directory []DirEntry `json:"directory"`
}

/**
Local function used to verify if the provided path is valid. `.` and `..` are forbidden in path to avoid getting to the parent directory of the working fir
*/
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

// Http Handler Func : returns the content of the provided folder
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
			resp.Directory = append(resp.Directory, DirEntry{Name: file.Name(), IsDir: file.IsDir(), Size: file.Size()})
		}

		successResponse(w, resp)
	}

}

// Http Handler Func : remove the provided file path or folder path
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

// Http Handler Func : upload provided files to the provided path
func (s *server) upload(w http.ResponseWriter, r *http.Request, _ httprouter.Params) {
	// Parse our multipart form, 10 << 20 specifies a maximum of 10MB of its file parts stored in the memory, the remainder will be stored in temporary files
	// This does NOT specifies a maximum file or upload size. To do so, you have to use http.MaxByteReader.
	errMultipartForm := r.ParseMultipartForm(10 << 20)

	if errMultipartForm != nil {
		errorResponse(w, errMultipartForm.Error())
		return
	}

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

	// If the requests is successful, the requests print a success page which enable user to close the window
	successResponse(w, BaseAPIResponse{Status: "success"})
}

// response structure of cat requests
type catResponse struct {
	BaseAPIResponse
	Content string `json:"content"`
}

// Http Handler Func : returns the content of the provided file
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

// Http Handler Func : create a new folder with the provided name
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

// Http Handler Func : creates a file with the provided name
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

	file, err := os.OpenFile("."+path, os.O_CREATE, 0664)
	defer file.Close()

	if err != nil {
		errorResponse(w, err.Error())
		return
	}

	resp := BaseAPIResponse{Status: "success"}
	successResponse(w, resp)
}

// Http Handler Func : write provided content to the file, erasing the previous content
func (s *server) echo(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.PostFormValue("login")
	token := r.PostFormValue("token")
	path := r.PostFormValue("path")
	content := r.PostFormValue("content")
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

// Http Handler Func : move the folder or the file provided by path (src) to a new path (dest)
func (s *server) mv(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	src := r.FormValue("src")
	dest := r.FormValue("dest")
	w.Header().Set("Content-Type", "application/json")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(src, w) {
		return
	}

	if !verifyPath(dest, w) {
		return
	}

	if _, errE := os.Stat("." + dest); errE == nil {
		errorResponse(w, "File already exists")
		return
	}

	err := os.Rename("."+src, "."+dest)

	if err != nil {
		errorResponse(w, err.Error())
		return
	}

	resp := BaseAPIResponse{Status: "success"}
	successResponse(w, resp)
}

// Http Handler Func : serve the provided file, by path
func (s *server) get(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	login := r.FormValue("login")
	token := r.FormValue("token")
	path := r.FormValue("path")

	if !s.logged(login, token, w) {
		return
	}

	if !verifyPath(path, w) {
		return
	}

	r.URL.Path = "" // avoid 301 to folder if url = index.html
	http.ServeFile(w, r, "."+path)
}
