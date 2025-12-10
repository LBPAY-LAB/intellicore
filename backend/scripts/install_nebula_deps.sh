#!/bin/bash
# Install Nebula Graph Go client dependency

cd /Users/jose.silva.lb/LBPay/supercore/backend
go get github.com/vesoft-inc/nebula-go/v3
go mod tidy
