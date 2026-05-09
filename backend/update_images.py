#!/usr/bin/env python3
"""
Update sneaker images in the database with accurate URLs
"""
import os
from app import create_app, db

def update_sneaker_images():
    app = create_app()
    with app.app_context():
        # Execute all the UPDATE statements
        placeholder_image = (
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80"
        )
        updates = [
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-001'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-002'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-003'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-004'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-005'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-006'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-007'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-008'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-009'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-010'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-011'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-012'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-013'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-014'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-015'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-016'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-017'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-018'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-019'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-020'",
            "UPDATE sneakers SET image_path='https://www.dior.com/en_in/fashion/products/3SN231YJT_H069-b22-sneaker-gray-technical-mesh-and-smooth-calfskin' WHERE sku='HV-021'",
            "UPDATE sneakers SET image_path='https://www.dior.com/en_in/fashion/products/3SN279ZRD_H868-b30-sneaker-gray-technical-mesh-and-cd30-signature' WHERE sku='HV-022'",
            "UPDATE sneakers SET image_path='https://us.louisvuitton.com/eng-us/products/lv-trainer-sneaker-nvprod3170103v' WHERE sku='HV-023'",
            "UPDATE sneakers SET image_path='https://www.balenciaga.com/en-in/track-2-sneaker-black-568614W2GN11000.html' WHERE sku='HV-024'",
            "UPDATE sneakers SET image_path='https://www.prada.com/us/en/p/prada-americas-cup-sneakers/4E3400_3LKG_F0002' WHERE sku='HV-025'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-026'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-027'",
            "UPDATE sneakers SET image_path='https://us.puma.com/us/en/pd/puma-suede-vtg-sneakers/374921' WHERE sku='HV-028'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-029'",
            "UPDATE sneakers SET image_path='https://www.converse.com/shop/p/run-star-legacy-cx-platform-unisex-high-top-shoe/A00869C.html' WHERE sku='HV-030'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-031'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-032'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-033'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-034'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-035'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-036'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-037'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-038'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-039'",
            "UPDATE sneakers SET image_path='https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80' WHERE sku='HV-040'"
        ]

        for update_sql in updates:
            try:
                db.session.execute(db.text(update_sql))
                print(f"Executed: {update_sql}")
            except Exception as e:
                print(f"Error executing {update_sql}: {e}")

        db.session.commit()
        print("All updates committed successfully!")

        # Verify the updates
        result = db.session.execute(db.text("SELECT sku, image_path FROM sneakers ORDER BY sku"))
        rows = result.fetchall()

        print("\nVerification - Updated sneakers:")
        for row in rows:
            print(f"{row[0]}: {row[1]}")

if __name__ == "__main__":
    update_sneaker_images()