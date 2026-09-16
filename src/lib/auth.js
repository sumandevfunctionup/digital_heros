import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { connectDB } from "./mongodb";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET || "digital_heroes_fallback_dev_secret_key_2026";
const secretKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Hash plain text password using bcrypt
 */
export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare plain text password against hash
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Sign JWT token with payload (valid for 7 days)
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

/**
 * Verify JWT token
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract auth token from Request (Authorization header or HttpOnly Cookie)
 */
export async function getAuthToken(request) {
  // 1. Check Authorization Bearer header
  if (request && request.headers) {
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }
  }

  // 2. Check Next.js cookies()
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get("dh_token");
    if (tokenCookie) {
      return tokenCookie.value;
    }
  } catch {
    // Next.js cookies() may not be available outside request context
  }

  return null;
}

/**
 * Extract authenticated user session
 */
export async function getAuthSession(request) {
  const token = await getAuthToken(request);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Middleware helper: Requires authenticated user
 * Returns { user } on success, or { errorResponse } on failure
 */
export async function requireAuth(request) {
  const session = await getAuthSession(request);
  if (!session || !session.userId) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required. Please sign in.",
          },
        },
        { status: 401 }
      ),
      user: null,
    };
  }

  await connectDB();
  const user = await User.findById(session.userId).select("-passwordHash");
  if (!user) {
    return {
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "USER_NOT_FOUND",
            message: "The user account no longer exists.",
          },
        },
        { status: 401 }
      ),
      user: null,
    };
  }

  return { user, errorResponse: null };
}

/**
 * Middleware helper: Requires Administrator role (PRD § 03 & § 11)
 */
export async function requireAdmin(request) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse) return { user: null, errorResponse };

  if (user.role !== "admin") {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "FORBIDDEN",
            message: "Access denied. Administrator privileges required.",
          },
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}

/**
 * Middleware helper: Requires Active Subscription (PRD § 04: "Real-time subscription status check on every authenticated request")
 */
export async function requireActiveSubscriber(request) {
  const { user, errorResponse } = await requireAuth(request);
  if (errorResponse) return { user: null, errorResponse };

  // Admins bypass subscription check
  if (user.role === "admin") {
    return { user, errorResponse: null };
  }

  const isActive =
    user.subscriptionStatus === "active" || user.subscriptionStatus === "trialing";

  if (!isActive) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        {
          success: false,
          error: {
            code: "SUBSCRIPTION_REQUIRED",
            message:
              "Active subscription required to access this feature. Please subscribe to a monthly or yearly plan.",
            subscriptionStatus: user.subscriptionStatus,
          },
        },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
