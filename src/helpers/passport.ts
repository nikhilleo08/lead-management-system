import { PrismaClient } from "@prisma/client";
import passport from "passport";
import passportGoogle from "passport-google-oauth20";
import envConfig from "../config";
const prisma = new PrismaClient();
const GoogleStrategy = passportGoogle.Strategy;

export function useGoogleStrategy() {
  passport.use(
    new GoogleStrategy(
      {
        clientID: envConfig.GOOGLE_CLIENT_ID || "",
        clientSecret: envConfig.GOOGLE_CLIENT_SECRET || "",
        callbackURL: "/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          if (!profile._json.email) throw "User does not have email";

          let user = await prisma.user.findFirst({
            where: {
              email: profile._json.email,
            },
          });

          if (user) {
            done(null, { ...user });
          } else {
            const newUser = {
              name: profile._json.name,
              email: profile._json.email,
            };
            user = await prisma.user.create({
              data: newUser,
            });
            done(null, user);
          }
        } catch (err: any) {
          console.error(err);
          done(err);
        }
      }
    )
  );

  passport.serializeUser(function (user: Express.User, done) {
    done(null, user);
  });

  passport.deserializeUser(function (user: Express.User, done) {
    done(null, user);
  });
}
