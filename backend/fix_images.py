import os
from app import create_app, db
from models import Sneaker

def update_images():
    app = create_app()
    with app.app_context():
        mapping = {
            'HV-001': '/pics/jordan-1-squad-on-instagram-lost-and-founds-all-day-today-tag-me-in-your-photos-djamesandrew-.jpg',
            'HV-002': '/pics/download.jpg',
            'HV-003': '/pics/download-1-.jpg',
            'HV-004': '/pics/nike-air-yeezy-2-red-october.jpg',
            'HV-005': '/pics/nike-air-max-1-patta-waves-monarch-w-bracelet-men-s-size-8-dh1348-001.jpg',
            'HV-006': '/pics/nike-air-fear-of-god-1-triple-black.-jerry-lorenzo-s-tenth-release-of-fog-1-silhouette.-ar4237-005-nike-nikeair-fog',
            'HV-007': '/pics/air-jordan-3-retro-a-ma-maniere-40.jpg',
            'HV-008': '/pics/red-motorsports.jpg',
            'HV-009': '/pics/nike-sb-dunk-low-ben-jerry-s-chunky-sneakers.jpg',
            'HV-010': '/pics/adidas-originals-yeezy-boost-350-v2-white-core-black-red.jpg',
            'HV-011': '/pics/adidas-yeezy-boost-350-v2-onyx-us4.jpg',
            'HV-012': '/pics/now-available-adidas-samba-og-cloud-white-.jpg',
            'HV-013': '/pics/adidas-originals-campus-00s-core-black-ftw-white-trainers-mens-shoes-.jpg',
            'HV-014': '/pics/adidas-yeezy-foam-runner.jpg',
            'HV-015': '/pics/adidas-ultraboost-shoes-adidas-canada.jpg',
            'HV-016': '/pics/adidas-shoes-adidas-hu-nmd-s1-ryat-size-5-men-6-woman-human-race-pharrell-color-black-size-5.jpg',
            'HV-017': '/pics/adidas-gazelle-indoor-originals-casual-shoes-mens-12-blue-bird-gum-h06260-nby.jpg',
            'HV-018': '/pics/size-7-5-adidas-forum-bad-bunny-low-black-2021-back-to-school-buckle.jpg',
            'HV-019': '/pics/download-2-.jpg',
            'HV-020': '/pics/prada-x-adidas-superstar-sneakers.jpg',
            'HV-021': '/pics/dior-b22-sneakers.jpg',
            'HV-022': '/pics/sneaker-b30-countdown-mesh-tecnico-grigio-scuro-e-tessuto-tecnico-metallizzato-color-argento.jpg',
            'HV-023': '/pics/louis-vuitton-lv-trainers-monogram-denim-blue-.jpg',
            'HV-024': '/pics/balenciaga-ayakkab-track-2-bej-60-indirim-outlet-brand-store.jpg',
            'HV-025': '/pics/prada-america-s-cup-low-top-sneakers-black.jpg',
            'HV-026': '/pics/gucci-cream-leather-logo-print-rhyton-sneakers-size-37-5.jpg',
            'HV-027': '/pics/puma-mb-01-iridescent-dreams-black-lamelo-ball-men-s-basketball-shoe-376678-02.jpg',
            'HV-028': '/pics/suede-xl-sneakers-puma.jpg',
            'HV-029': '/pics/puma-bella-ut-silver-.jpg',
            'HV-030': '/pics/converse-run-star-legacy-cx-high-black-.jpg',
            'HV-031': '/pics/converse-chuck-70-high-comme-des-gar-ons-cdg-play-white-black-shoes-uk-12.jpg',
            'HV-032': '/pics/nike-air-max-97-og-silver-bullet-2022-.jpg',
            'HV-033': '/pics/a-couple-shots-of-my-small-jordan-11-collection-before-the-new-columbia-11s-retro-again-on-december-14th-this-saturday-who-else-is-getting-a-pair-of-those-.jpg',
            'HV-034': '/pics/nike-dunk-low-x-off-white-lot-29-of-50-sail-neutral-gray-2024.jpg',
            'HV-035': '/pics/nike-kobe-6-grinch-429659-701.jpg',
            'HV-036': '/pics/nike-air-jordan-1-1-.jpg',
            'HV-037': '/pics/nike-air-max-97-bw.jpg',
            'HV-038': '/pics/adidas-yeezy-boost-700-wave-runner-b75571.jpg',
            'HV-039': '/pics/nike-x-off-white-poster-spoof-nike-air-presto-nick-arley.jpg',
            'HV-040': '/pics/air-jordan-1-retro-og-2023-high-satin-bred-black-red-white-size-10w-8-5-men.jpg',
        }
        
        for sku, path in mapping.items():
            sneaker = Sneaker.query.filter_by(sku=sku).first()
            if sneaker:
                sneaker.image_path = path
                print(f"Updated {sku}: {path}")
            else:
                print(f"SKU {sku} not found")
        
        db.session.commit()
        print("Database updated successfully!")

if __name__ == "__main__":
    update_images()
