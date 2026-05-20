package httprequest

import (
	"fmt"
	"reflect"

	"github.com/gofiber/fiber/v3/client"
)

// HttpHeaders mirrors Fiber client response headers: each key may have multiple values.
type HttpHeaders map[string][]string

// HttpResponseOf is the typed HTTP response. Use [Execute] with a type argument, e.g.
// Execute[any](d) for dynamic JSON, or Execute[MyStruct](d) for a known body shape.
type HttpResponseOf[T any] struct {
	StatusCode int         `json:"status_code"`
	Status     string      `json:"status"`
	Headers    HttpHeaders `json:"headers"`
	Body       T           `json:"body"`
}

// HttpResponse is Execute[any] with a dynamic JSON/string body.
type HttpResponse = HttpResponseOf[any]

func collectHeaders(resp *client.Response) HttpHeaders {
	headers := make(HttpHeaders)
	for key, values := range resp.Headers() {
		headers[key] = append([]string(nil), values...)
	}
	return headers
}

func newHttpResponseOf[T any](resp *client.Response) (*HttpResponseOf[T], error) {
	out := &HttpResponseOf[T]{
		StatusCode: resp.StatusCode(),
		Status:     resp.Status(),
		Headers:    collectHeaders(resp),
	}

	body, err := decodeBody[T](resp)
	if err != nil {
		return nil, err
	}
	out.Body = body
	return out, nil
}

func decodeBody[T any](resp *client.Response) (T, error) {
	var zero T
	if len(resp.Body()) == 0 {
		return zero, nil
	}

	switch any(zero).(type) {
	case string:
		return any(resp.String()).(T), nil
	case []byte:
		return any(append([]byte(nil), resp.Body()...)).(T), nil
	default:
		if isAny[T]() {
			return any(parseBodyAny(resp)).(T), nil
		}
		var body T
		if err := resp.JSON(&body); err != nil {
			return zero, fmt.Errorf("decode response body: %w", err)
		}
		return body, nil
	}
}

func isAny[T any]() bool {
	return reflect.TypeFor[T]() == reflect.TypeFor[any]()
}

func parseBodyAny(resp *client.Response) any {
	if len(resp.Body()) == 0 {
		return nil
	}

	var v any
	if err := resp.JSON(&v); err == nil {
		return v
	}
	return resp.String()
}
