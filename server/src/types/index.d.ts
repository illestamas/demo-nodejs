/* 
  In Typescript, express' "request" interface does not allow "user" object to be added.
  Therefore a custom version of "request" is added to Express.
*/

declare namespace Express {
  export interface Request {
    user: any
  }
}
