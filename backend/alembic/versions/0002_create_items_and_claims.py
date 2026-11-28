"""create items and claims tables

Revision ID: 0002_create_items_and_claims
Revises: 0001_create_users
Create Date: 2026-11-28 00:00:00.000000

"""

# Python Modules
from collections.abc import Sequence
from typing import Union

# Database Modules
import sqlalchemy as sa
from alembic import op

revision: str = "0002_create_items_and_claims"
down_revision: Union[str, None] = "0001_create_users"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ITEM_CATEGORIES = (
    "electronics",
    "wallets",
    "keys",
    "bags",
    "clothing",
    "documents",
    "jewelry",
    "other",
)
ITEM_STATUSES = ("open", "returned")
CLAIM_STATUSES = ("pending", "approved", "rejected")


def upgrade() -> None:
    op.create_table(
        "items",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column(
            "category",
            sa.Enum(
                *ITEM_CATEGORIES,
                name="item_category",
                native_enum=False,
                length=32,
                create_constraint=True,
            ),
            nullable=False,
        ),
        sa.Column("location", sa.String(length=200), nullable=False),
        sa.Column("found_on", sa.Date(), nullable=False),
        sa.Column("image_url", sa.String(length=2048), nullable=True),
        sa.Column(
            "status",
            sa.Enum(
                *ITEM_STATUSES,
                name="item_status",
                native_enum=False,
                length=32,
                create_constraint=True,
            ),
            server_default="open",
            nullable=False,
        ),
        sa.Column("finder_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["finder_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_items_category"), "items", ["category"])
    op.create_index(op.f("ix_items_status"), "items", ["status"])
    op.create_index(op.f("ix_items_finder_id"), "items", ["finder_id"])

    op.create_table(
        "claims",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("claimant_id", sa.Integer(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column(
            "status",
            sa.Enum(
                *CLAIM_STATUSES,
                name="claim_status",
                native_enum=False,
                length=32,
                create_constraint=True,
            ),
            server_default="pending",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["item_id"], ["items.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["claimant_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_claims_item_id"), "claims", ["item_id"])
    op.create_index(op.f("ix_claims_claimant_id"), "claims", ["claimant_id"])
    op.create_index(op.f("ix_claims_status"), "claims", ["status"])


def downgrade() -> None:
    op.drop_index(op.f("ix_claims_status"), table_name="claims")
    op.drop_index(op.f("ix_claims_claimant_id"), table_name="claims")
    op.drop_index(op.f("ix_claims_item_id"), table_name="claims")
    op.drop_table("claims")
    op.drop_index(op.f("ix_items_finder_id"), table_name="items")
    op.drop_index(op.f("ix_items_status"), table_name="items")
    op.drop_index(op.f("ix_items_category"), table_name="items")
    op.drop_table("items")
