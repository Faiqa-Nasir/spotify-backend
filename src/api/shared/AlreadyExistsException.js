// Base class for already existing exceptions
class AlreadyExistsException extends Error {
    constructor(message) {
      super(message);
      this.name = "AlreadyExistsException";
      this.statusCode = 409; // Conflict status code
    }
  }
  
  // Subclass for username already existing exception
  class UsernameAlreadyExistsException extends AlreadyExistsException {
    constructor() {
      super("Username already exists");
    }
  }
  
  // Subclass for email already existing exception
  class EmailAlreadyExistsException extends AlreadyExistsException {
    constructor() {
      super("Email already exists");
    }
  }
  
  export {
    AlreadyExistsException,
    UsernameAlreadyExistsException,
    EmailAlreadyExistsException
  };
  