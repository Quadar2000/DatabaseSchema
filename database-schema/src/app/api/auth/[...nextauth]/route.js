import NextAuth from "next-auth";
import { authOptions } from "../../../../auth";

// const {
//   handlers
// } = NextAuth(authOptions);

// export { handlers as GET, handlers as POST };
//export {auth, signIn, signOut};

export async function GET( req,res ) {
  return NextAuth(req,res,authOptions)
  };
    
export async function POST( req,res ) {
  return NextAuth(req,res,authOptions)
  };
