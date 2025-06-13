// app/api/user/route.ts
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth"; // Adjust path to your auth config
import { headers } from "next/headers";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userData = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!userData[0]) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(userData[0]);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, image, currentPassword, newPassword } = body;

    // Basic validation
    if (name && (typeof name !== "string" || name.trim().length === 0)) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (email && (typeof email !== "string" || !email.includes("@"))) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    let emailChanged = false;
    let passwordChanged = false;

    // Handle password change
    if (newPassword && currentPassword) {
      if (newPassword.length < 8) {
        return NextResponse.json(
          { error: "Password must be at least 8 characters long" },
          { status: 400 }
        );
      }

      try {
        await auth.api.changePassword({
          body: {
            currentPassword,
            newPassword,
          },
          headers: await headers(),
        });
        passwordChanged = true;
      } catch (error: any) {
        console.error("Password change error:", error);
        return NextResponse.json(
          { error: "Invalid current password or failed to update password" },
          { status: 400 }
        );
      }
    }

    // Handle email change - update directly in database
    if (email && email !== session.user.email) {
      try {
        // Check if email already exists
        const existingUser = await db
          .select()
          .from(user)
          .where(eq(user.email, email.trim()))
          .limit(1);

        if (existingUser[0] && existingUser[0].id !== session.user.id) {
          return NextResponse.json(
            { error: "Email already in use" },
            { status: 400 }
          );
        }

        // Update email in database and set emailVerified to false
        await db
          .update(user)
          .set({
            email: email.trim(),
            emailVerified: false,
            updatedAt: new Date().toISOString(),
          })
          .where(eq(user.id, session.user.id));

        // Send verification email for the new email
        try {
          await auth.api.sendVerificationEmail({
            body: {
              email: email.trim(),
            },
            headers: await headers(),
          });
        } catch (emailError) {
          console.error("Failed to send verification email:", emailError);
          // Don't fail the entire request if email sending fails
        }

        emailChanged = true;
      } catch (error: any) {
        console.error("Email update error:", error);
        return NextResponse.json(
          { error: "Failed to update email" },
          { status: 400 }
        );
      }
    }

    // Update other profile fields in database
    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (name) updateData.name = name.trim();
    if (image !== undefined) updateData.image = image?.trim() || null;

    // Only update if there are fields to update (and email wasn't already updated above)
    if (Object.keys(updateData).length > 1 || !emailChanged) {
      const updatedUser = await db
        .update(user)
        .set(updateData)
        .where(eq(user.id, session.user.id))
        .returning();

      if (!updatedUser[0]) {
        return NextResponse.json(
          { error: "Failed to update user" },
          { status: 500 }
        );
      }

      // If email was changed, get the updated user data
      if (emailChanged) {
        const finalUser = await db
          .select()
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);

        return NextResponse.json({
          ...finalUser[0],
          message: emailChanged
            ? "Profile updated. Please verify your new email address."
            : "Profile updated successfully",
          emailVerificationRequired: emailChanged,
          passwordChanged,
        });
      }

      return NextResponse.json({
        ...updatedUser[0],
        message: passwordChanged
          ? "Profile and password updated successfully"
          : "Profile updated successfully",
        passwordChanged,
      });
    }

    // If only email was changed
    if (emailChanged) {
      const updatedUser = await db
        .select()
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);

      return NextResponse.json({
        ...updatedUser[0],
        message: "Email updated. Please verify your new email address.",
        emailVerificationRequired: true,
      });
    }

    return NextResponse.json({
      message: "No changes made",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
