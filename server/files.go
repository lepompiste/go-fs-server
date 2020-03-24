package server

import (
	"os"
	"io"
	"fmt"
	"net/http"
	"io/ioutil"
	"github.com/julienschmidt/httprouter"
	"encoding/json"
	"strings"
)

const (
	MAXUPLOAD = 20000000000
)

type DirEntry struct {
	Name string `json:"name"`
	IsDir bool `json:"isDir"`
}

type LsResponse struct {
	BaseApiResponse
	Path string `json:"path"`
	Directory []DirEntry `json:"directory"`
}

func ls(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	path := r.URL.Query().Get("path")

	w.Header().Set("Content-Type", "application/json")

	parts := strings.Split(path, "/")
	for _, part := range parts {
		if part == ".." {
			resp := BaseApiResponse{"error", "Forbidden use of .."}
			bytes, _ := json.Marshal(resp)
			fmt.Fprint(w, string(bytes))
			return
		}
	}

	files, err := ioutil.ReadDir("." + path)

	if err != nil {
		resp := BaseApiResponse{"error", err.Error()}
		bytes, _ := json.Marshal(resp)
		fmt.Fprint(w, string(bytes))
	} else {
		resp := LsResponse{Path:path, Directory:[]DirEntry{}}
		resp.Status = "success"
		for _, file := range files {
			resp.Directory = append(resp.Directory, DirEntry{Name:file.Name(), IsDir:file.IsDir()})
		}

		bytes, _ := json.Marshal(resp)
		fmt.Fprint(w, string(bytes))
	}
	
}

func rm(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	path := r.URL.Query().Get("path")

	w.Header().Set("Content-Type", "application/json")

	parts := strings.Split(path, "/")
	for _, part := range parts {
		if part == ".." {
			resp := BaseApiResponse{"error", "Forbidden use of .."}
			bytes, _ := json.Marshal(resp)
			fmt.Fprint(w, string(bytes))
			return
		}
	}

	err := os.Remove("." + path)

	if err != nil {
		resp := BaseApiResponse{"error", err.Error()}
		bytes, _ := json.Marshal(resp)
		fmt.Fprint(w, string(bytes))
	} else {
		resp := BaseApiResponse{"success", ""}
		bytes, _ := json.Marshal(resp)
		fmt.Fprint(w, string(bytes))
	}
}

func upload(w http.ResponseWriter, r *http.Request, ps httprouter.Params) {
	path := r.URL.Query().Get("path")

	w.Header().Set("Content-Type", "application/json")

	parts := strings.Split(path, "/")
	for _, part := range parts {
		if part == ".." {
			resp := BaseApiResponse{"error", "Forbidden use of .."}
			bytes, _ := json.Marshal(resp)
			fmt.Fprint(w, string(bytes))
			return
		}
	}


	errMultipartForm := r.ParseMultipartForm(MAXUPLOAD)

	if errMultipartForm != nil {
		resp := BaseApiResponse{"error", errMultipartForm.Error()}
		bytes, _ := json.Marshal(resp)
		fmt.Fprint(w, string(bytes))
		return
	}

	formdata := r.MultipartForm
	files := formdata.File["uploads"]

	for i, _ := range files { // loop through the files one by one
		file, errFile := files[i].Open()
		defer file.Close()

		if errFile != nil {
			resp := BaseApiResponse{"error", errFile.Error()}
			bytes, _ := json.Marshal(resp)
			fmt.Fprint(w, string(bytes))
			return
		}

		out, errOut := os.Create("." + path + "/" + files[i].Filename)
		defer out.Close()

		if errOut != nil {
			resp := BaseApiResponse{"error", errOut.Error()}
			bytes, _ := json.Marshal(resp)
			fmt.Fprint(w, string(bytes))
			return
		}

		_, errCopy := io.Copy(out, file)

		if errCopy != nil {
			resp := BaseApiResponse{"error", errCopy.Error()}
			bytes, _ := json.Marshal(resp)
			fmt.Fprint(w, string(bytes))
			return
		}
	}

	resp := BaseApiResponse{"success", ""}
	bytes, _ := json.Marshal(resp)
	fmt.Fprint(w, string(bytes))
}