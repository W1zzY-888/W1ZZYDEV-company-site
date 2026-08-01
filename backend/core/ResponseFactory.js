export class ResponseFactory {
  json(data, { status = 200, headers = {} } = {}) {
    return {
      status,
      headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
      body: JSON.stringify(data)
    };
  }

  ok(data = {}) {
    return this.json({ ok: true, data });
  }

  error(error, requestId = '') {
    return this.json({
      ok: false,
      error: {
        code: error.code || 'BACKEND_ERROR',
        message: error.message || 'Unexpected backend error',
        requestId
      }
    }, { status: error.status || 500 });
  }
}
