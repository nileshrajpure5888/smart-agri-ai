from fastapi import Depends, HTTPException, status

from app.services.jwt_service import get_current_user


# ======================
# ADMIN ONLY
# ======================
def admin_only(user=Depends(get_current_user)):

    if user.get("role") != "admin":

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )

    return user


# ======================
# EDITOR / ADMIN
# ======================
def editor_or_admin(user=Depends(get_current_user)):

    if user.get("role") not in ["admin", "editor"]:

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Permission denied"
        )

    return user


# ======================
# ANY LOGGED-IN USER
# ======================
def login_required(user=Depends(get_current_user)):
    """
    Just checks if token is valid
    """

    return user
