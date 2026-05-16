# Step 1.0: Build dependencies for Go app
FROM golang:1.26.2-alpine AS build
RUN apk update
RUN apk add --no-cache binutils upx
WORKDIR /app
COPY app/go.mod app/go.sum ./
# go.mod replace: ../packages/models → /packages/models (parent of /app)
COPY packages/models/ /packages/models/
COPY packages/entitymanager/ /packages/entitymanager/
COPY packages/view/ /packages/view/
COPY packages/authorization/ /packages/authorization/
RUN go mod download
COPY app/ ./


RUN mkdir -p bin && \
    CGO_ENABLED=0 go build -ldflags="-s -w" -o /main main.go && \
    strip /main && \
    upx --best --lzma /main

# Stage 2: Minimal runtime using scratch
FROM scratch
# # Expose ports (adjust as needed)
EXPOSE 3000

# Copy optimized binary
COPY --from=build /main /app
COPY --from=build /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/


ENTRYPOINT ["/app"]
