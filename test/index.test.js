const { expect } = require('chai');
const request = require('request');

describe('AppController', function() {
  it('Test GET /status', (done) => {
    request.get('http://localhost:5000/status', (error, response, body) => {
      expect(response.statusCode).to.be.equal(200);
      expect(response.body).to.be.equal('{"redis":true,"db":true}')
      done()
    })
  })

  it('Test GET /stat', (done) => {
  request.get('http://localhost:5000/stats', (error, response, body) => {
    expect(response.statusCode).to.be.equal(200);
    expect(response.body).to.match(/"users":\d+,"files":\d+/);
    done();
  });
  });
})

describe('AuthController', function() {
  it('Test GET /connect', (done) => {
    request({
      headers: {
        Authorization: 'Basic Ym9iQGR5bGFuLmNvbTp0b3RvMTIzNCE='
      },
      uri: 'http://localhost:5000/connect',
      method: 'GET'
    }, (error, response, body) => {
    expect(response.statusCode).to.be.equal(200);
    const token = body
    console.log(token)
    done()
    })
  })

  it('Test GET /disconnect', (done) => {
    request.get('http://localhost:5000/disconnect', (error, response, body) => {
    expect(response.statusCode).to.be.equal(401);
    done();
    });
  });
})

describe('FilesController', function() {
  describe('Tests for POST /files', function () {
    it('Test POST /files', (done) => {
      request.post('http://localhost:5000/files', (error, response, body) => {
      expect(response.statusCode).to.be.equal(401);
      done()
      })

      it('Test POST /files', (done) => {
        request.post('http://localhost:5000/files', (error, response, body) => {
        expect(response.statusCode).to.be.equal(401);
        done()
        })
      })
    })
  })
  
  it('Test POST /files/:id', (done) => {
    request.post('http://localhost:5000/files/:id', (error, response, body) => {
    expect(response.statusCode).to.be.equal(404);
    done();
    });
  });

  it('Test GET /files', (done) => {
    request.get('http://localhost:5000/files', (error, response, body) => {
      expect(response.statusCode).to.be.equal(401);
      done()
    })
  })
  
    it('Test POST /files/:id/publish', (done) => {
    request.post('http://localhost:5000/files/:id/publish', (error, response, body) => {
      expect(response.statusCode).to.be.equal(404);
      done();
    });
  });

    it('Test POST /ubpublish', (done) => {
    request.post('http://localhost:5000/files/:id/unpublish', (error, response, body) => {
      expect(response.statusCode).to.be.equal(404);
      done()
    })
  })
  
  describe('', function() {
    it('Test GET /files/:id/data', (done) => {
      request.get('http://localhost:5000/files/:id/data', (error, response, body) => {
        expect(response.statusCode).to.be.equal(200);
        done();
      });
    });
  })
})

describe('UsersController', function() {
  it('Test POST /users', (done) => {
    request.post('http://localhost:5000/users', (error, response, body) => {
    expect(response.statusCode).to.be.equal(400);
    done()
    })
  })
  
  it('Test GET /users/me', (done) => {
    request.get('http://localhost:5000/users/me', (error, response, body) => {
    expect(response.statusCode).to.be.equal(401);
    done();
    });
  });
})
