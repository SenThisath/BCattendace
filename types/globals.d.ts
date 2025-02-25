export { };

// Create a type for the roles
export type Roles = "admin" | "superadmin" | "developer";

declare global {
    interface CustomJwtSessionClaims {
        metadata: {
            role?: Roles;
        };
    }
}
