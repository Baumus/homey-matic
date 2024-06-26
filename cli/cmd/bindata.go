// Code generated for package cmd by go-bindata DO NOT EDIT. (@generated)
// sources:
// data/driver/assets/icon.svg
// data/driver/device.js
// data/driver/driver.compose.json
// data/driver/driver.flow.compose.json
// data/driver/driver.js
package cmd

import (
	"bytes"
	"compress/gzip"
	"fmt"
	"io"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"
	"time"
)

func bindataRead(data []byte, name string) ([]byte, error) {
	gz, err := gzip.NewReader(bytes.NewBuffer(data))
	if err != nil {
		return nil, fmt.Errorf("Read %q: %v", name, err)
	}

	var buf bytes.Buffer
	_, err = io.Copy(&buf, gz)
	clErr := gz.Close()

	if err != nil {
		return nil, fmt.Errorf("Read %q: %v", name, err)
	}
	if clErr != nil {
		return nil, err
	}

	return buf.Bytes(), nil
}

type asset struct {
	bytes []byte
	info  os.FileInfo
}

type bindataFileInfo struct {
	name    string
	size    int64
	mode    os.FileMode
	modTime time.Time
}

// Name return file name
func (fi bindataFileInfo) Name() string {
	return fi.name
}

// Size return file size
func (fi bindataFileInfo) Size() int64 {
	return fi.size
}

// Mode return file mode
func (fi bindataFileInfo) Mode() os.FileMode {
	return fi.mode
}

// Mode return file modify time
func (fi bindataFileInfo) ModTime() time.Time {
	return fi.modTime
}

// IsDir return file whether a directory
func (fi bindataFileInfo) IsDir() bool {
	return fi.mode&os.ModeDir != 0
}

// Sys return file is sys mode
func (fi bindataFileInfo) Sys() interface{} {
	return nil
}

var _dataDriverAssetsIconSvg = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\x8c\x57\x4d\x8f\xe3\xc8\xcd\xbe\x0f\x30\xff\xa1\x5e\xcd\x65\x06\xaf\x44\x17\x59\x5f\x64\xa7\xdd\x0b\x24\x93\xc5\xee\x61\x2f\xc9\x66\x03\xec\x4d\x23\xa9\x6d\x61\x6c\xa9\x21\xa9\xed\xee\xf9\xf5\x41\xe9\xcb\xee\xf1\x6e\x10\x5f\xc4\x7a\xf8\x14\x8b\x7c\x8a\x55\x92\xef\x7f\x78\x39\x1e\xd4\xa9\xea\xfa\xba\x6d\xb6\x09\x82\x4e\x54\xd5\x14\x6d\x59\x37\xbb\x6d\xf2\xaf\x5f\x7f\xcc\x38\x51\xfd\x90\x37\x65\x7e\x68\x9b\x6a\x9b\x34\x6d\xf2\xc3\xc3\xfb\x77\xf7\xff\x97\x65\xea\x6f\x5d\x95\x0f\x55\xa9\xce\xf5\xb0\x57\x3f\x37\x5f\xfb\x22\x7f\xaa\xd4\xc7\xfd\x30\x3c\xdd\x6d\x36\xe7\xf3\x19\xea\x19\x84\xb6\xdb\x6d\x3e\xa9\x2c\x7b\x78\xff\xee\xfd\xbb\xfb\xfe\xb4\x7b\xff\x4e\x29\xf5\x72\x3c\x34\xfd\x5d\x59\x6c\x93\x79\xce\xd3\x73\x77\x18\xb9\x65\xb1\xa9\x0e\xd5\xb1\x6a\x86\x7e\x83\x80\x9b\xe4\x8a\x5f\x5c\xf8\x45\xcc\xa0\x3e\x55\x45\x7b\x3c\xb6\x4d\x3f\x4e\x6d\xfa\x0f\xd7\xec\xae\x7c\x5c\xe9\x31\xa5\xb3\x19\x59\x28\x22\x1b\x4d\x1b\xa2\xac\x2b\x1f\xb3\xfe\xb5\x19\xf2\x97\xec\xbb\xb9\xfd\x69\xf7\x47\x73\x49\x6b\xbd\xe9\x4f\xbb\x2b\xea\xff\x48\xbb\xeb\xdb\xb2\x7e\x6a\xcb\x7a\xe5\x2f\x00\xf4\xed\x73\x57\x54\x8f\x6d\xb7\xab\xa0\xa9\x86\xcd\xe7\x5f\x3f\xaf\xce\x4c\x43\x39\x94\xd7\x71\x16\x61\xdf\xac\xfb\x46\xed\x26\x3f\x56\xfd\x53\x5e\x54\xfd\x66\xc1\xa7\x00\xe7\xba\x1c\xf6\xdb\xc4\x69\x3d\x8d\xf7\x55\xbd\xdb\x0f\x57\xc0\xa9\xae\xce\x7f\x6d\x5f\xb6\x89\x56\x5a\xa1\x21\x20\x41\xef\x57\x2b\xcc\xac\x4b\xcf\xe0\x84\xd4\xe5\x36\xe9\x4f\x3b\x9e\x47\xf3\xa2\x77\x2b\x51\x83\x10\x58\xf5\xd1\x95\xb9\x67\x29\x0c\x9a\x54\x91\x46\xc9\x34\x66\x68\x3f\x4d\xd3\x96\x92\xef\xca\xb6\x88\x25\x6c\x93\xba\x68\x1b\x88\x32\x3e\x44\xc2\x7d\x59\x3d\xf6\x23\x73\x5a\x30\x0e\x29\x51\x9b\xc9\xb9\xce\x8e\x53\xcb\x58\xc8\x15\xf5\x4b\xde\xcf\x12\x28\xf5\x94\xef\xaa\xa2\x3d\xb4\xdd\x36\xf9\xf0\x38\xfe\x16\xcf\x97\xb6\x2b\xab\x6e\xf1\xf9\xf1\xf7\xd6\xd7\x3e\xe5\x45\x3d\xbc\x4e\xa7\x65\x89\xbf\x54\x1b\x03\xaf\x04\xfd\x27\x84\x7e\x9f\x97\xed\x79\x9b\xd0\x8d\xf7\x5b\xdb\x1e\x63\x60\xc3\xc2\x9e\xe4\xc6\x5f\xbc\x6c\x93\x60\x41\x0c\x91\xb7\xb7\xde\xd7\x6d\x42\x8c\xc0\xd6\x72\xb8\xf1\x96\x6d\xf1\x1c\x4f\x54\xf6\xdc\xd4\x43\xbf\x4d\x8e\xc7\xdb\x00\xcf\x5d\x17\x19\x87\xfc\xb5\xea\xb6\xc9\xf8\xc0\x85\xd5\xef\xdb\xf3\xae\x8b\x4a\x3e\xe6\x87\x8b\x94\x73\xb4\xa7\x97\x9b\x68\xe7\xba\x29\xdb\x73\x36\x37\x1c\x0a\xdd\xaa\x31\x53\x96\x1e\x44\x8d\xb7\x79\xcf\x9c\x97\x6d\x92\xf1\x9f\x39\x5f\xff\x9b\xf3\x98\xbf\xd4\xc7\xfa\x5b\x55\x6e\x13\x5c\x5b\xe5\x58\x0d\x79\x99\x0f\xf9\x55\x83\x2c\x90\x9b\x5a\x4d\xa9\xfb\xae\x7c\xbc\xfb\xc7\xe7\x1f\xe7\xa1\x52\xf7\x45\x71\xf7\xef\xb6\xfb\xba\x8c\x95\x52\x91\x92\x7f\x69\x9f\x87\x6d\x92\x3c\x5c\xf0\xfb\xb2\xb8\x7b\x6c\xbb\x63\x3e\x3c\xd4\xc7\x7c\x57\xc5\x8b\xe0\xff\x5f\x8e\x87\xfb\xcd\xc5\xf1\x96\x3d\xbc\x3e\x55\x57\x71\xa7\xc8\x5d\x35\xdd\x0b\x7f\x78\x43\x96\xc5\xb1\x8e\xb3\x36\xff\x1c\xea\xc3\xe1\xe7\xb8\xcc\x52\xde\x55\xd8\x7a\x38\x54\x0f\xe3\xb2\x93\xb9\xd6\xb2\x99\x8b\x59\x8a\xdd\x5c\x57\x7b\xbf\x59\xd4\x98\x86\xbb\xef\xb5\x3d\xe4\x5f\xaa\xc3\x36\xf9\xfb\x97\xaa\xa9\x14\xde\x48\xbf\xeb\xda\xe7\xa7\x63\x5b\x56\x73\x17\x25\x57\x3a\xbf\x6d\xab\xa1\xcb\x9b\x3e\x2a\xb2\x4d\x46\xf3\x90\x0f\xd5\x47\x9d\x66\xe8\x2d\x04\xcd\x86\x3e\xad\xdb\xf1\x94\x0f\xfb\xb5\xba\x7e\x78\x3d\x54\xdb\xe4\xb1\x3e\x1c\xee\x3e\xe8\xf1\xf7\x97\x7e\xe8\xda\xaf\xd5\xd4\x71\x77\x1a\x5c\x30\x3a\x38\x5c\x1b\x43\xa9\xb8\xcb\x0a\x2d\xa0\x38\x6f\x42\x4a\xc6\x80\x71\xce\x92\x3a\xa9\xcc\x69\x70\x12\xd8\xa8\x83\x22\xb0\x5e\x5b\xa2\x34\x23\xb0\x68\x03\x2d\x08\x5e\x10\x87\x40\xde\x19\x4e\x35\xa0\xf5\x26\xdc\x02\xe3\xd3\x52\xea\x34\x58\xed\x6e\xc6\xa8\xe6\x58\x9c\x4e\xd1\xc3\x02\x84\x19\x60\xf5\x93\xf2\x0e\xbc\x33\x9a\xed\x25\x6d\xf5\xbb\xfa\x45\x21\x3a\x10\xf4\x96\x53\x62\x02\xd6\x01\x55\xa1\x32\x0d\x64\x30\x50\x9a\x69\x30\xc1\x8a\x55\x19\x06\x70\xac\xc9\x99\x88\x45\x41\x78\xac\x14\x43\x60\xe1\x0b\xf6\x93\x1a\xe3\x59\xf6\x26\x6a\x61\x19\xc4\xdb\x18\x52\xa7\x99\x21\xd0\x64\x5d\x88\xe1\x51\x98\x7c\x9a\x59\x01\xcd\xde\x1b\x35\x07\x08\x13\x66\x90\x89\x23\x26\xa4\xc5\x8d\xd1\xbd\xe0\x88\x84\xc0\x26\xf8\x54\x02\x38\xb2\x6e\xd4\xc2\x90\x97\x54\x18\x5c\x40\x83\x4a\x83\xd7\x8c\x82\xa9\x06\x2f\x3a\xb0\x62\xa0\xa0\x9d\x4b\x35\x30\x7a\x21\xe5\x34\x04\xa7\x25\x44\x81\xd9\xc4\x4d\x33\x06\x08\x7d\xaa\x41\xa3\x75\xca\x0a\x08\x3a\x17\x53\x89\xf5\x69\x36\x11\xf2\xac\xad\x1d\x21\xe7\x90\x82\xfa\xa6\x8e\x2a\x6e\xb4\x0b\x2e\xcd\x84\x41\x84\x83\x99\xa5\x43\x37\x49\xe7\xbc\x73\x5e\x65\xa8\x81\x9d\x37\x63\x1d\x01\xbd\xb1\x53\x8f\x58\x11\xba\x82\x8c\x01\x66\x63\x1c\xa5\x7a\xf4\x6b\x0e\xc1\x49\x6c\x02\x66\x41\x15\x65\xf1\x12\x88\x4d\x1a\xa5\x12\x23\x4a\x83\x61\xc3\x3e\x26\x1e\x8d\xa0\x30\x00\x89\x37\x36\xd6\xee\x28\xce\x8a\x3b\x84\xce\x52\x48\x35\x58\x12\x46\x75\x88\xc5\x38\xe3\x35\x4d\xf5\x59\x71\xa2\x26\x23\xd8\xd4\x32\x58\xb2\x96\xa7\x42\x34\x93\x4d\xc9\x83\x37\xc6\x7a\xa5\x41\x5b\xef\x23\x85\x11\x6d\x6c\x43\x62\xef\x6c\x6a\x05\x88\xed\x48\xb0\xde\x5a\x9b\xea\xa8\x9f\x8d\xf9\x09\xa1\x48\x9a\x49\x0c\xc1\x14\x77\xcb\x3a\x8e\x1b\x2a\x01\xd8\x11\xe1\x28\xa3\x01\xb2\x88\x2e\x15\x0f\xcc\x2e\x38\x85\xe0\x75\x30\x94\x66\x08\xce\x88\xe0\xd8\x49\x02\xec\x29\xd8\xd5\x8a\xe7\x2b\x23\xd0\xda\x85\x90\x22\x88\xb5\xda\x2f\x80\x5f\x81\x53\x2c\xd7\x3a\x76\x3c\xf6\x20\x05\x20\x4d\x44\xb1\x6f\x82\x18\x4c\x57\xaf\x06\x23\x6c\xdd\x35\x40\x28\xe8\x52\xad\x10\x90\x30\xd8\x28\x97\x17\x12\xaf\x96\x45\xe6\xfc\xc6\x22\x32\x0b\x5e\xbc\xc3\x34\xb3\x01\x82\xb5\xce\xab\xdf\x14\xb2\x8d\x62\x91\x8b\x07\xd0\x83\x76\x2c\x96\xe2\x36\x69\x8f\x1a\xe3\x09\xb1\x0c\x68\xd8\xe0\xc5\xd8\x47\x53\x24\x08\xc9\x6a\xf1\xb4\x04\x3b\x10\x8f\x34\x76\xee\xa8\x7d\x14\xc6\x78\x30\xa2\x29\xa8\xbd\x32\x1e\xc4\x1b\xe3\x16\xc3\xb2\x3a\xa9\xd5\xbf\x1a\xd7\xb9\x90\x80\x16\xe7\x84\xd4\xef\xea\xa8\x42\xbc\xc6\x8c\x27\x4e\x75\xcc\x5e\x02\x58\x64\xf9\x7e\x82\xf7\xec\x7d\x88\xa1\x1d\x30\x06\x9a\x9f\x28\x53\x0a\xe3\x22\x6e\xb5\xe6\xdc\x3d\xc7\x5b\x47\x1c\xa6\x7a\xcc\x1a\x81\x0c\xf9\x38\x03\x81\xb5\xf3\xc1\x5c\x59\x27\xb5\xf8\xa7\xa7\x7b\x9b\x83\xb1\x40\x2e\x9e\xfa\x31\x69\x1b\x00\x8d\xb3\xc6\xa6\x26\x5e\x5b\x7a\xbc\xc0\x18\x1c\xb3\xf8\x71\xd3\xf4\x78\x7e\x88\xc0\x5b\xe3\x8d\xb9\x40\x4b\xf0\x58\xee\x65\xc6\xe2\x45\x70\x1e\x3d\x8d\x47\xd0\x93\xe6\x78\xb3\x8d\xc0\x15\x12\xe2\x05\x28\x91\xa3\xc8\x02\x69\x47\xf3\x92\x81\xe4\x8a\x9f\x2d\x13\xbe\xa9\x5f\x94\x78\x08\xc8\xd6\xbb\xf1\xb5\x41\xc6\xa3\xfa\x4d\x91\x36\x10\x28\x76\xf5\x9b\x42\x1d\x18\x11\x8b\xa2\x4e\x51\x78\x87\xc6\x84\x8b\xb1\x57\x46\x83\x77\xe2\xc8\x5c\x59\x51\x6d\x22\xd0\xde\x98\x78\xd2\x1c\x41\xac\x9a\xe3\xa1\xb2\x01\xc7\x43\x15\x50\x88\xe2\x42\x02\x01\x91\xc9\x2b\x8c\x8d\x66\xfd\x74\xa8\x66\x26\xa5\x0b\x73\x41\xcc\x8c\x18\xb5\x1f\x6f\x51\x0c\xe8\xfc\x95\xf5\xed\xf2\x82\x8c\xef\xe7\xf8\x9a\x35\x62\xec\x15\xba\x7e\x20\xb6\x4d\x53\x15\x43\xdb\x65\xc5\x73\x77\xca\x87\xe7\xae\xda\x26\x7a\xfd\xa8\xda\xec\xe2\x7f\xc3\xf8\xad\xf3\xf0\xfe\xdd\x7f\x02\x00\x00\xff\xff\x70\x54\x97\xe5\x5c\x0e\x00\x00")

func dataDriverAssetsIconSvgBytes() ([]byte, error) {
	return bindataRead(
		_dataDriverAssetsIconSvg,
		"data/driver/assets/icon.svg",
	)
}

func dataDriverAssetsIconSvg() (*asset, error) {
	bytes, err := dataDriverAssetsIconSvgBytes()
	if err != nil {
		return nil, err
	}

	info := bindataFileInfo{name: "data/driver/assets/icon.svg", size: 3676, mode: os.FileMode(438), modTime: time.Unix(1715717688, 0)}
	a := &asset{bytes: bytes, info: info}
	return a, nil
}

var _dataDriverDeviceJs = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\xcc\x94\x5d\x6f\xda\x3c\x14\xc7\xef\x91\xf8\x0e\x47\xb9\x09\x11\xe0\x3e\xbd\x25\x4f\x26\x75\x2b\x5b\x2b\xf5\x4d\x85\xfb\xc9\x49\x4e\xc1\x9b\xb1\x99\x7d\xc2\x60\x51\xbe\xfb\xe4\xbc\x40\x9a\xd2\xd1\x9b\x4e\xeb\x55\x73\xfe\xe7\xcd\xfe\xff\xb0\x9f\x59\x04\x4b\x46\x24\xe4\x87\xfd\x5e\xbf\x97\x68\x65\x09\xae\xf4\x0a\x77\x10\x81\xc1\x1f\x99\x30\x38\xf0\x97\x2e\xe0\x07\x61\x93\x70\x89\x1b\x91\x60\x3b\x83\xb1\x33\xc6\xce\xa4\x88\xcf\xd2\x52\x63\xdf\x6c\x99\xdf\xef\xe5\x39\x88\x27\x50\x9a\x80\xdd\x66\x92\x44\x5d\x3b\x2e\x0a\xa7\x8d\x9d\xc8\x3e\xf1\x35\x8f\x85\x14\x24\xd0\x56\x4a\x35\x27\x69\xe2\xbb\x5b\xbe\x86\x08\xf2\x7e\x0f\x00\xc0\x95\x19\xae\x16\x08\x42\x09\x12\x5c\x76\x3a\xb8\x06\x2e\xcf\xcb\x73\x56\x14\xde\xa4\xa9\x2b\x63\xc9\x92\x2b\x85\xd2\x9b\xc0\xf9\xa8\x15\xfe\x8e\x3b\x6f\x02\xde\x6c\x7e\x31\x9f\x7a\x6d\x61\xc3\x65\x86\xf3\xdd\x1a\x9d\x1c\x6b\x2d\x91\x2b\xaf\xd2\x8b\xd1\x61\x1f\x54\x69\x7b\xae\xe4\x96\x9e\x6f\xf5\xae\x8b\xf4\x7b\x45\x7d\xd7\x28\x2d\xfe\xf1\x0a\xf7\x89\x2a\x3d\x98\xb0\xff\x48\x24\xb7\xb6\x04\x60\xc5\x49\x24\xb5\x59\xb8\x25\x54\xa9\x6d\x7c\xcf\x5d\x0b\x37\x57\xab\x6b\x25\x68\x10\xb4\xcf\xb5\xe1\x06\x44\xba\x85\x08\x68\x29\x2c\x5b\x20\x5d\x72\xe2\x83\x80\x71\x22\x23\xe2\x8c\xd0\xb2\x6b\x95\xe2\x36\x3c\xd4\x34\x1c\xb4\x01\x69\x2e\xb3\xd2\x5f\xc1\xa4\x3d\xf4\x15\x58\xda\x33\xde\x02\xcd\xfe\xbe\x8f\xc0\x73\xc2\xbb\x93\x1e\xbe\xc5\xcb\xe6\xaf\x18\xbd\xdc\xbf\x0d\x59\x6b\xcf\xd3\xb0\xfd\xd5\xc5\x0f\x9f\xc5\x73\x8b\x4b\x36\x4f\xda\xd6\x2d\xea\x9c\xf9\x58\xcc\x66\x6b\x34\xac\xa6\xf1\x59\xc3\x20\xdc\xff\x42\xf6\xcf\x8d\x42\x60\x77\xd9\x2a\x46\xf3\x31\x23\xd2\xca\xc2\x7f\x65\xb7\x2a\xb3\xa6\x43\xfc\xc2\xe9\x96\x0c\x9f\x6e\x50\xd1\x8d\xb0\x84\x0a\x8d\x7d\x89\xba\x45\xf9\x54\xb3\xde\x02\xfa\x49\x1b\x18\x48\x24\x88\xcb\x09\x10\xc1\x79\xd8\xfc\xff\x7f\xe4\x78\xee\x6c\x50\x14\x8d\x3e\x1c\x06\x5d\xe7\xdc\x0c\x16\x1b\x91\x2e\x90\x69\x35\xf0\xd1\xed\x34\xf6\x61\x58\x29\xd5\x8b\x7b\x91\xa6\x06\xad\x85\x21\xf8\x13\x27\xd5\xd3\x86\xe0\x8f\x1f\x1e\xa7\xb3\xd9\xd7\xd9\xd5\xfd\xe3\xdc\x1f\xc1\xa0\xf4\x30\x80\xe8\xc3\x31\x42\xaa\x8e\x46\x6c\xd0\x30\x32\x62\xb1\x68\x76\x7c\x70\xdd\x31\xfd\x2c\xf5\xcf\x81\x4b\x1a\x41\x0e\x5e\x35\xc4\x9b\x34\xd3\x8a\x63\xd1\x11\x78\x6b\x57\xdc\x60\x63\x97\xda\x90\x07\x45\xd0\xe1\x26\x08\xdf\xe3\xd8\x37\xf7\x77\x5f\xfe\x85\x53\x4b\xad\x16\x27\x0e\x5d\xec\x59\x6d\x43\x5e\xbf\xed\x2b\x9d\x66\x12\x19\x6e\xd7\xda\x90\x85\xa8\xfb\x48\x87\xfd\xde\xef\x00\x00\x00\xff\xff\xe9\x6e\x77\xbb\xcf\x07\x00\x00")

func dataDriverDeviceJsBytes() ([]byte, error) {
	return bindataRead(
		_dataDriverDeviceJs,
		"data/driver/device.js",
	)
}

func dataDriverDeviceJs() (*asset, error) {
	bytes, err := dataDriverDeviceJsBytes()
	if err != nil {
		return nil, err
	}

	info := bindataFileInfo{name: "data/driver/device.js", size: 1999, mode: os.FileMode(438), modTime: time.Unix(1715717688, 0)}
	a := &asset{bytes: bytes, info: info}
	return a, nil
}

var _dataDriverDriverComposeJson = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\xc4\x95\x4f\x6b\xe3\x30\x10\xc5\xef\x81\x7c\x87\xc1\xe7\x90\xdc\x7b\x2b\xe9\x61\x73\x59\x0a\xcb\x9e\x4a\x59\x26\xb6\xb0\x07\x24\x59\x68\xc6\x61\x4b\xc8\x77\x5f\x24\x39\x89\xe3\x3f\x21\x5b\x4c\x7b\x4b\xe4\x37\x6f\xde\x6f\x24\x5b\xc7\xe5\x02\x00\x20\xa3\x22\x7b\x82\xec\x78\x84\xf5\x8b\xa7\x83\xf2\x3f\xd1\x28\x38\x9d\xb2\x55\xfb\xdc\xa2\x51\xd9\x13\xb4\xf2\xb8\xa4\xec\x78\x49\x92\x9c\xce\x95\xb9\x46\xe6\x5b\xe5\x36\x2c\x75\xdd\x73\x74\xb8\x27\x4d\x42\x2a\x48\xdf\xde\xcf\x0f\xc8\x60\x19\x97\xba\x8d\x35\xfa\x32\x84\xc9\x36\x45\xb4\xe3\xcd\x20\xc4\x06\x99\x95\xf0\x26\xd5\x6f\x62\xc5\xda\xd9\xf2\xdc\x31\xfa\xb0\x41\xad\xff\xcb\x27\x56\x44\x9f\x1e\xa4\x43\xf2\x21\xf8\xd5\xbd\x13\xb8\x33\x60\x4d\x2c\x7f\xf6\x9e\x8a\x40\xb5\xea\x49\x44\x19\xa7\x51\xd4\x45\x58\xa8\x03\xe5\x23\xc2\xda\x09\xd5\xb6\x37\x96\x2b\x16\xd9\xb2\xd1\x18\xf2\x88\x6f\xd4\xad\xe2\xd4\xf7\xb2\x78\xa0\x12\x83\xdf\x84\x9d\x55\x7f\x65\x90\xa8\x67\x7a\xfd\xdb\xf5\xbf\x33\x82\x29\xb2\x87\x47\xf0\x70\x6c\x2c\x8a\x39\x52\x77\x6d\xee\x85\x1e\x6f\xd7\xb6\xba\x1c\x6b\x56\x22\x64\x4b\xbe\x7f\x64\xe4\xc3\x45\xcf\xd2\xd7\x8d\x1b\x74\xd5\xb8\x57\x7a\x02\x3e\xbd\x9a\x2f\x31\x07\x14\x28\xd8\x47\xef\x9b\xe5\x15\xe9\xc2\xc7\xb2\xb7\xa1\xdf\x48\x8b\xee\x68\xdc\x20\xdc\x00\x21\x85\x9d\x52\xdd\x41\xe9\x21\x3d\x3b\x97\x8d\x8b\xfa\x48\x97\xc2\x03\xea\x26\x66\xf8\x51\x1b\x65\x50\x28\x1f\x71\x18\xab\xbe\x4f\x9d\x3e\x19\x5f\x06\x9e\xbe\x4a\x9f\x66\x9f\x4c\x50\x91\x95\x87\x02\xec\x2c\x98\x9a\x05\x72\x64\xc5\x20\x95\x82\x34\x01\x08\x37\x03\x50\x5a\xe2\xf0\x1b\xdb\xc7\xe9\xf4\x85\x41\xac\x60\xdf\x08\x70\x6d\xce\x45\x0c\xdc\x38\x57\x7b\x01\xd3\x68\x21\xa7\x6f\xe4\xbc\x86\x9d\x05\xa9\x6a\x56\xd7\x76\x1f\x60\xa8\xac\x04\x6c\x2d\x60\x50\xf2\x6a\x3d\x35\x8c\x39\x76\x17\x8b\xc2\x2b\x1e\xbc\xea\x17\xd5\xec\xdb\x9b\xe8\x9f\xdb\xb6\x9f\xde\xe6\x39\xd8\xf3\xbc\xd9\xbd\x7e\x19\xf9\x76\xfb\x1b\x76\xaf\xdf\x4e\xfc\x4b\x79\xc2\x69\x9e\x33\xb5\x84\x5b\x65\x1e\xe8\xb6\xe3\x9c\xe0\xb7\x4b\xef\xc3\xfb\x67\xb9\x38\x2d\x17\xff\x02\x00\x00\xff\xff\xb1\x5f\x77\x10\xf3\x09\x00\x00")

func dataDriverDriverComposeJsonBytes() ([]byte, error) {
	return bindataRead(
		_dataDriverDriverComposeJson,
		"data/driver/driver.compose.json",
	)
}

func dataDriverDriverComposeJson() (*asset, error) {
	bytes, err := dataDriverDriverComposeJsonBytes()
	if err != nil {
		return nil, err
	}

	info := bindataFileInfo{name: "data/driver/driver.compose.json", size: 2547, mode: os.FileMode(438), modTime: time.Unix(1715717688, 0)}
	a := &asset{bytes: bytes, info: info}
	return a, nil
}

var _dataDriverDriverFlowComposeJson = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\xb4\x54\xc1\x6a\xeb\x30\x10\xbc\x07\xf2\x0f\x8b\xc8\x31\xc9\x07\x18\xde\x25\xbc\x1e\x0a\x25\x14\xda\x5b\xc9\x41\xc6\x5b\xd7\x54\x96\x8c\x2c\xbb\x14\xa3\x7f\x2f\x92\x5d\xdb\x51\x2c\xd9\x84\x3a\xa7\x64\x77\x76\x32\x33\x1e\xdc\x6c\x37\x00\x00\x44\xc9\x2c\x4d\x51\x96\x24\x82\xb7\x76\x64\x3e\xcd\xf0\xd5\xa2\xb2\x84\x44\x40\x9a\x06\x8e\xff\x65\x56\xa3\x3c\xd3\x1c\x41\xeb\x43\x21\xb1\x2c\xc9\xde\x41\xab\x4c\x31\x24\x91\xcb\x62\x77\xc8\x0d\xd3\xa9\x52\x4a\x70\x78\xa8\x91\x2b\x72\x8d\xd2\x37\x6c\xe2\x13\xb9\xa3\xcf\xa3\xb3\xbf\xe1\x34\x37\x02\x48\x6c\xff\xc7\x15\x38\x50\x7f\x17\x16\xc6\xab\x3c\x46\xe9\x87\xf9\xfd\x4c\xfa\x22\xd3\x38\x7d\x3b\x76\x46\x17\xd7\x3b\x95\xe9\x4a\xce\x3b\x4b\xbf\x8a\xe7\x12\x4a\xa4\x28\x12\xf1\xe5\x07\xd6\x94\x55\xe8\xd1\xda\x6b\x6e\x0e\xb0\x6b\x85\x95\x10\xfd\x83\xe3\xd9\xe6\x7e\xea\x26\x7a\x22\xa0\xf1\xa9\xa4\x3c\x45\xd8\xd5\x94\x99\xe3\x47\x85\x92\x2a\x1c\x08\x83\xe7\xfe\x15\x5c\xf5\xdb\xb2\x6b\xed\xb3\xd9\x1f\x30\x1a\x23\x0b\x57\xa2\xc7\xb6\xd5\x18\x91\x87\x6f\x02\x36\xb4\x89\x21\x7b\x07\xde\xc5\x30\xf2\xbe\x37\x2b\xe4\xc9\x6c\x8a\x21\xcc\x65\xa2\xa1\x13\x49\xcc\x75\xcf\xbe\x15\x5e\x4d\x73\x66\xeb\xf7\x6c\xa0\x10\xc6\xfe\x69\x05\x17\x15\xa1\xfc\x10\x52\xad\xd0\x81\x17\xcb\x7b\xff\xe3\x0f\x28\x5a\x66\x8c\x09\x9e\xae\xe0\xeb\xc9\xd0\xde\x6f\x6b\x79\x19\x9d\xd7\xe5\xf0\xb3\xdb\x5c\xb6\x1b\xbd\xdd\xfc\x04\x00\x00\xff\xff\x91\x7e\x98\x31\xdc\x06\x00\x00")

func dataDriverDriverFlowComposeJsonBytes() ([]byte, error) {
	return bindataRead(
		_dataDriverDriverFlowComposeJson,
		"data/driver/driver.flow.compose.json",
	)
}

func dataDriverDriverFlowComposeJson() (*asset, error) {
	bytes, err := dataDriverDriverFlowComposeJsonBytes()
	if err != nil {
		return nil, err
	}

	info := bindataFileInfo{name: "data/driver/driver.flow.compose.json", size: 1756, mode: os.FileMode(438), modTime: time.Unix(1715717688, 0)}
	a := &asset{bytes: bytes, info: info}
	return a, nil
}

var _dataDriverDriverJs = []byte("\x1f\x8b\x08\x00\x00\x00\x00\x00\x00\xff\x8c\x54\x4d\x6f\xdb\x30\x0c\xbd\x07\xc8\x7f\xe0\xa9\x92\x81\x44\xd9\x3d\xf0\x0e\x6b\x31\x6c\xc0\x50\x14\x43\x6f\x43\x31\x28\x36\xe3\x28\x93\xa5\x8c\x92\x93\x16\x86\xff\xfb\x20\xd9\xae\x13\x27\xe9\xc2\x93\x4d\x3e\x3e\x7e\x3c\xda\xac\x72\x08\xce\x93\xca\x3c\x5b\x4e\x27\xd3\x49\x66\x8d\xf3\xf0\xcd\x96\xf8\x06\x29\x10\xfe\xad\x14\x21\x67\x9b\xe0\x60\xc9\xb2\x07\x3c\x90\xda\x23\x1d\x23\x84\x58\x08\xb1\xd0\x6a\xb5\xc8\x63\x4c\x6c\x5d\xc4\x4f\x27\x99\x96\xce\x45\xca\x52\x7a\x95\x75\xa9\xf8\xea\xd1\xe4\xae\x67\xaa\x03\x12\x00\xc0\x9a\xef\x46\x79\x9e\x04\x0f\x74\xe6\xaa\x1d\x92\xe8\x23\xcb\x21\x50\xd7\x73\x50\x6b\x10\xf7\x72\x27\x57\x4a\x2b\xaf\xd0\x41\xd3\x0c\x00\xbf\x51\x4e\x64\xc7\xd1\x14\x7e\x0d\xe1\x9e\x83\xa4\x29\x10\x94\x51\x5e\x49\xfd\x01\x5d\x30\x56\xd7\x20\xa0\x69\xd8\xec\x9c\x07\x4d\x7e\x82\xef\xfa\xd3\xd2\xf9\x1b\x58\x2f\xc2\xd8\x29\xdb\xb8\xc2\xcb\x68\x1b\xa8\x1d\xfe\x7f\x03\x2f\x1f\x93\xc6\x9c\x4d\x2f\xd8\xf3\xdb\xae\xcd\x8a\x93\xb7\x7a\x3d\xca\x32\x94\x61\xc7\xe5\x63\x96\xb6\x05\xbf\x90\x2e\xb6\x56\x19\xce\x66\x2c\x99\x01\xdb\x48\x07\x2b\x44\x13\x17\x8e\x79\x77\x26\x43\x43\x61\x65\x06\x41\x3c\x56\xe5\x0a\xe9\x4b\xe5\xbd\x35\x0e\x3e\xc1\xfc\xac\xc7\xdf\x6b\x6d\x0f\xcf\xa4\x8a\xa2\xc7\x3d\x11\x3a\x87\x39\xa4\x60\xf0\xd0\xde\xb1\xf8\xaa\xed\xe1\x5e\x52\xde\x01\x1f\x70\xaf\x32\xe4\xe7\xd3\xcc\x77\x21\x99\x25\xa7\xca\x08\xc2\x42\x39\x8f\xc4\xaf\x05\x7e\x56\xe6\x47\x78\x30\x48\x9c\x4b\x2a\xdc\x0c\x9c\x97\x1e\x13\x48\x3f\x1f\x9f\x71\x6f\x6a\x0d\x11\x26\x56\xb1\x65\x48\xd3\x16\xdf\xbf\xdf\xdd\x41\x0c\xc7\x76\xc2\xfa\x06\xc4\xbb\x2b\xb9\x44\x1c\x8c\xd0\x57\x64\xe0\x89\x6c\xa9\x1c\x0a\x42\x67\xf5\x1e\xb9\xa7\x0a\x93\xf3\x8c\xa6\x3d\x98\x5b\xb9\xb6\x98\x79\xbe\x96\xda\x5d\xe4\x3a\x75\x35\xc9\xf5\x23\x6b\x7a\xc1\x6f\x10\xdb\x5f\x90\x37\x28\xca\xf3\xa8\xe3\x0c\xbc\xfd\x83\x66\xd8\x79\x7d\xeb\x8d\x8c\xd4\xec\xea\x5c\xa1\x1d\x81\x33\xe9\xb3\x4d\x7b\xe8\x48\x64\x29\x79\x9f\x6b\x3c\x6e\x1c\xb5\xb4\x79\xa5\x51\xe0\xeb\xce\x92\x0f\xdf\xd2\xe8\x6f\xb8\x9c\x4e\xfe\x05\x00\x00\xff\xff\xf3\x3e\x47\x31\x8a\x05\x00\x00")

func dataDriverDriverJsBytes() ([]byte, error) {
	return bindataRead(
		_dataDriverDriverJs,
		"data/driver/driver.js",
	)
}

func dataDriverDriverJs() (*asset, error) {
	bytes, err := dataDriverDriverJsBytes()
	if err != nil {
		return nil, err
	}

	info := bindataFileInfo{name: "data/driver/driver.js", size: 1418, mode: os.FileMode(438), modTime: time.Unix(1715717688, 0)}
	a := &asset{bytes: bytes, info: info}
	return a, nil
}

// Asset loads and returns the asset for the given name.
// It returns an error if the asset could not be found or
// could not be loaded.
func Asset(name string) ([]byte, error) {
	cannonicalName := strings.Replace(name, "\\", "/", -1)
	if f, ok := _bindata[cannonicalName]; ok {
		a, err := f()
		if err != nil {
			return nil, fmt.Errorf("Asset %s can't read by error: %v", name, err)
		}
		return a.bytes, nil
	}
	return nil, fmt.Errorf("Asset %s not found", name)
}

// MustAsset is like Asset but panics when Asset would return an error.
// It simplifies safe initialization of global variables.
func MustAsset(name string) []byte {
	a, err := Asset(name)
	if err != nil {
		panic("asset: Asset(" + name + "): " + err.Error())
	}

	return a
}

// AssetInfo loads and returns the asset info for the given name.
// It returns an error if the asset could not be found or
// could not be loaded.
func AssetInfo(name string) (os.FileInfo, error) {
	cannonicalName := strings.Replace(name, "\\", "/", -1)
	if f, ok := _bindata[cannonicalName]; ok {
		a, err := f()
		if err != nil {
			return nil, fmt.Errorf("AssetInfo %s can't read by error: %v", name, err)
		}
		return a.info, nil
	}
	return nil, fmt.Errorf("AssetInfo %s not found", name)
}

// AssetNames returns the names of the assets.
func AssetNames() []string {
	names := make([]string, 0, len(_bindata))
	for name := range _bindata {
		names = append(names, name)
	}
	return names
}

// _bindata is a table, holding each asset generator, mapped to its name.
var _bindata = map[string]func() (*asset, error){
	"data/driver/assets/icon.svg":          dataDriverAssetsIconSvg,
	"data/driver/device.js":                dataDriverDeviceJs,
	"data/driver/driver.compose.json":      dataDriverDriverComposeJson,
	"data/driver/driver.flow.compose.json": dataDriverDriverFlowComposeJson,
	"data/driver/driver.js":                dataDriverDriverJs,
}

// AssetDir returns the file names below a certain
// directory embedded in the file by go-bindata.
// For example if you run go-bindata on data/... and data contains the
// following hierarchy:
//     data/
//       foo.txt
//       img/
//         a.png
//         b.png
// then AssetDir("data") would return []string{"foo.txt", "img"}
// AssetDir("data/img") would return []string{"a.png", "b.png"}
// AssetDir("foo.txt") and AssetDir("notexist") would return an error
// AssetDir("") will return []string{"data"}.
func AssetDir(name string) ([]string, error) {
	node := _bintree
	if len(name) != 0 {
		cannonicalName := strings.Replace(name, "\\", "/", -1)
		pathList := strings.Split(cannonicalName, "/")
		for _, p := range pathList {
			node = node.Children[p]
			if node == nil {
				return nil, fmt.Errorf("Asset %s not found", name)
			}
		}
	}
	if node.Func != nil {
		return nil, fmt.Errorf("Asset %s not found", name)
	}
	rv := make([]string, 0, len(node.Children))
	for childName := range node.Children {
		rv = append(rv, childName)
	}
	return rv, nil
}

type bintree struct {
	Func     func() (*asset, error)
	Children map[string]*bintree
}

var _bintree = &bintree{nil, map[string]*bintree{
	"data": &bintree{nil, map[string]*bintree{
		"driver": &bintree{nil, map[string]*bintree{
			"assets": &bintree{nil, map[string]*bintree{
				"icon.svg": &bintree{dataDriverAssetsIconSvg, map[string]*bintree{}},
			}},
			"device.js":                &bintree{dataDriverDeviceJs, map[string]*bintree{}},
			"driver.compose.json":      &bintree{dataDriverDriverComposeJson, map[string]*bintree{}},
			"driver.flow.compose.json": &bintree{dataDriverDriverFlowComposeJson, map[string]*bintree{}},
			"driver.js":                &bintree{dataDriverDriverJs, map[string]*bintree{}},
		}},
	}},
}}

// RestoreAsset restores an asset under the given directory
func RestoreAsset(dir, name string) error {
	data, err := Asset(name)
	if err != nil {
		return err
	}
	info, err := AssetInfo(name)
	if err != nil {
		return err
	}
	err = os.MkdirAll(_filePath(dir, filepath.Dir(name)), os.FileMode(0755))
	if err != nil {
		return err
	}
	err = ioutil.WriteFile(_filePath(dir, name), data, info.Mode())
	if err != nil {
		return err
	}
	err = os.Chtimes(_filePath(dir, name), info.ModTime(), info.ModTime())
	if err != nil {
		return err
	}
	return nil
}

// RestoreAssets restores an asset under the given directory recursively
func RestoreAssets(dir, name string) error {
	children, err := AssetDir(name)
	// File
	if err != nil {
		return RestoreAsset(dir, name)
	}
	// Dir
	for _, child := range children {
		err = RestoreAssets(dir, filepath.Join(name, child))
		if err != nil {
			return err
		}
	}
	return nil
}

func _filePath(dir, name string) string {
	cannonicalName := strings.Replace(name, "\\", "/", -1)
	return filepath.Join(append([]string{dir}, strings.Split(cannonicalName, "/")...)...)
}
