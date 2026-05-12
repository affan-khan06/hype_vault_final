"""
Seed script: creates SneakerSize + Inventory rows for all existing sneakers.
Safe to run multiple times - skips if already seeded.
Does NOT touch any frontend code or existing data.
"""
from app import app
from models import db, Sneaker, SneakerSize, Inventory

# Standard sizes to add for every sneaker
SIZES = [
    {'size_label': 'UK 6',  'us_size': 7.0,  'uk_size': 6.0,  'eu_size': 39.0},
    {'size_label': 'UK 7',  'us_size': 8.0,  'uk_size': 7.0,  'eu_size': 40.0},
    {'size_label': 'UK 8',  'us_size': 9.0,  'uk_size': 8.0,  'eu_size': 41.0},
    {'size_label': 'UK 9',  'us_size': 10.0, 'uk_size': 9.0,  'eu_size': 42.0},
    {'size_label': 'UK 10', 'us_size': 11.0, 'uk_size': 10.0, 'eu_size': 43.0},
    {'size_label': 'UK 11', 'us_size': 12.0, 'uk_size': 11.0, 'eu_size': 44.0},
]

STOCK_PER_SIZE = 5  # pairs per size per sneaker

with app.app_context():
    sneakers = Sneaker.query.all()
    print(f"Found {len(sneakers)} sneakers. Seeding sizes + inventory...\n")

    sizes_created = 0
    inventory_created = 0
    skipped = 0

    for sneaker in sneakers:
        for size_data in SIZES:
            # Check if size already exists
            existing_size = SneakerSize.query.filter_by(
                sneaker_id=sneaker.id,
                size_label=size_data['size_label']
            ).first()

            if existing_size:
                size = existing_size
            else:
                size = SneakerSize(
                    sneaker_id=sneaker.id,
                    size_label=size_data['size_label'],
                    us_size=size_data['us_size'],
                    uk_size=size_data['uk_size'],
                    eu_size=size_data['eu_size'],
                    available=True,
                    price_adjustment=0
                )
                db.session.add(size)
                db.session.flush()  # get size.id
                sizes_created += 1

            # Check if inventory already exists for this sneaker+size
            existing_inv = Inventory.query.filter_by(
                sneaker_id=sneaker.id,
                size_id=size.id
            ).first()

            if existing_inv:
                skipped += 1
                continue

            inventory = Inventory(
                sneaker_id=sneaker.id,
                size_id=size.id,
                stock_quantity=STOCK_PER_SIZE,
                warehouse_location='Mumbai Vault',
                lot_status='available'
            )
            db.session.add(inventory)
            inventory_created += 1

    db.session.commit()

    print(f"Done!")
    print(f"  Sizes created:     {sizes_created}")
    print(f"  Inventory created: {inventory_created}")
    print(f"  Already existed:   {skipped}")
    print(f"\nEach sneaker now has {len(SIZES)} sizes x {STOCK_PER_SIZE} pairs = {len(SIZES) * STOCK_PER_SIZE} units.")
    print("Checkout should now work with real DB orders.")
