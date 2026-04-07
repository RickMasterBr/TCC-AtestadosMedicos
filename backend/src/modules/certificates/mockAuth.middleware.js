// Middleware FAKE para simular um usuário logado
// Isso substitui temporariamente o auth real (Dev 3)
function mockAuthMiddleware(req, res, next) {
    req.user = {
      id: "user-mock-123", 
      role: "EMPLOYEE"
    };
    next();
  }
  
  module.exports = { mockAuthMiddleware };