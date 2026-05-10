# HYPE VAULT PDF RECEIPT GENERATOR
# Backend utility for generating premium invoice PDFs
#
# INSTALL:
# pip install reportlab pillow
#
# FEATURES:
# - Professional invoice layout with HYPE VAULT branding
# - Sneaker details with images
# - Customer info and loyalty tier
# - INR pricing with taxes and fees
# - QR code for order tracking
 

from reportlab.lib.pagesizes import letter, A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image, PageBreak
from reportlab.lib.enums import TA_CENTER, TA_RIGHT, TA_LEFT
from datetime import datetime
import io
import qrcode
from PIL import Image as PILImage
import os

class HypeVaultInvoiceGenerator:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self.setup_custom_styles()
        
    def setup_custom_styles(self):
        """Setup custom paragraph styles for the invoice"""
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#000000'),
            spaceAfter=6,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold',
        ))
        
        self.styles.add(ParagraphStyle(
            name='Subtitle',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#666666'),
            alignment=TA_CENTER,
            spaceAfter=12,
        ))
        
        self.styles.add(ParagraphStyle(
            name='SectionHeader',
            parent=self.styles['Heading2'],
            fontSize=12,
            textColor=colors.HexColor('#1F2937'),
            fontName='Helvetica-Bold',
            spaceAfter=6,
        ))

    def generate_qr_code(self, order_number):
        """Generate QR code for order tracking"""
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=4,
            border=2,
        )
        qr.add_data(f"https://hypevault.com/order/{order_number}")
        qr.make(fit=True)
        
        # Create PIL image
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Save to bytes
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='PNG')
        img_bytes.seek(0)
        return img_bytes

    def generate_invoice(self, order_data, output_path=None):
        """
        Generate PDF invoice
        
        order_data format:
        {
            'order_number': 'HV-2024-001',
            'order_date': '2024-01-15',
            'customer': {
                'name': 'John Doe',
                'email': 'john@example.com',
                'phone': '+91-XXXXX-XXXXX',
                'loyalty_tier': 'gold',
                'profile_handle': 'john.doe'
            },
            'shipping_address': {
                'street': '123 Main St',
                'city': 'Mumbai',
                'state': 'MH',
                'zipcode': '400001',
                'country': 'India'
            },
            'items': [
                {
                    'name': 'Jordan 4 Military Black',
                    'sku': 'AJ4-MB-001',
                    'size': '10',
                    'quantity': 1,
                    'unit_price': 46999,
                    'total_price': 46999,
                    'image_path': '/path/to/image.jpg'  # Optional
                }
            ],
            'subtotal': 46999,
            'shipping_fee': 599,
            'handling_fee': 299,
            'tax': 8460,
            'total': 56357,
            'payment_method': 'upi'
        }
        """
        
        if output_path is None:
            output_path = io.BytesIO()
        
        # Create PDF document
        doc = SimpleDocTemplate(
            output_path,
            pagesize=A4,
            rightMargin=0.5*inch,
            leftMargin=0.5*inch,
            topMargin=0.5*inch,
            bottomMargin=0.5*inch,
        )
        
        story = []
        
        # Header section
        story.append(self._build_header(order_data))
        story.append(Spacer(1, 0.3*inch))
        
        # Order info and customer info side by side
        story.append(self._build_order_customer_info(order_data))
        story.append(Spacer(1, 0.2*inch))
        
        # Items table
        story.append(self._build_items_table(order_data['items']))
        story.append(Spacer(1, 0.15*inch))
        
        # Totals section
        story.append(self._build_totals(order_data))
        story.append(Spacer(1, 0.15*inch))
        
        # Footer with QR code
        story.append(self._build_footer(order_data))
        
        # Build PDF
        doc.build(story)
        
        if isinstance(output_path, io.BytesIO):
            output_path.seek(0)
            return output_path
        
        return output_path

    def _build_header(self, order_data):
        """Build PDF header with branding"""
        from reportlab.platypus import Table, TableStyle
        from reportlab.lib import colors
        
        header_data = [
            [
                Paragraph(
                    '<font name="Helvetica-Bold" size="20">HYPE VAULT</font>',
                    self.styles['Normal']
                ),
                Paragraph(
                    f"<b>Invoice #{order_data['order_number']}</b><br/>"
                    f"<font size='9'>{order_data['order_date']}</font>",
                    ParagraphStyle(
                        'InvoiceNum',
                        parent=self.styles['Normal'],
                        alignment=TA_RIGHT,
                        fontSize=11
                    )
                )
            ]
        ]
        
        header_table = Table(header_data, colWidths=[3*inch, 3*inch])
        header_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#1F2937')),
        ]))
        
        return header_table

    def _build_order_customer_info(self, order_data):
        """Build order and customer information section"""
        customer = order_data['customer']
        address = order_data['shipping_address']
        
        loyalty_tier_display = customer.get('loyalty_tier', 'bronze').upper()
        
        info_data = [
            [
                Paragraph('<b>ORDER DETAILS</b>', self.styles['SectionHeader']),
                Paragraph('<b>CUSTOMER INFORMATION</b>', self.styles['SectionHeader']),
            ],
            [
                Paragraph(
                    f"Order Number: {order_data['order_number']}<br/>"
                    f"Order Date: {order_data['order_date']}<br/>"
                    f"Payment Method: {order_data['payment_method'].upper()}<br/>"
                    f"Status: CONFIRMED",
                    self.styles['Normal']
                ),
                Paragraph(
                    f"<b>{customer['name']}</b><br/>"
                    f"@{customer['profile_handle']}<br/>"
                    f"{loyalty_tier_display} MEMBER<br/><br/>"
                    f"Email: {customer['email']}<br/>"
                    f"Phone: {customer['phone']}<br/><br/>"
                    f"{address['street']}<br/>"
                    f"{address['city']}, {address['state']} {address['zipcode']}<br/>"
                    f"{address['country']}",
                    self.styles['Normal']
                )
            ]
        ]
        
        info_table = Table(info_data, colWidths=[3*inch, 3*inch])
        info_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 11),
            ('LINEBELOW', (0, 0), (-1, 0), 1, colors.HexColor('#E5E7EB')),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ]))
        
        return info_table

    def _build_items_table(self, items):
        """Build items/products table"""
        items_data = [['SKU', 'Product', 'Size', 'Qty', 'Unit Price', 'Total']]
        
        for item in items:
            items_data.append([
                item['sku'],
                item['name'],
                item['size'],
                str(item['quantity']),
                f"₹{item['unit_price']:,.0f}",
                f"₹{item['total_price']:,.0f}"
            ])
        
        items_table = Table(
            items_data,
            colWidths=[1*inch, 2.2*inch, 0.6*inch, 0.5*inch, 1*inch, 1*inch]
        )
        items_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F3F4F6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#1F2937')),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 8),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#E5E7EB')),
            ('ALIGN', (1, 1), (1, -1), 'LEFT'),
            ('ALIGN', (4, 1), (5, -1), 'RIGHT'),
        ]))
        
        return items_table

    def _build_totals(self, order_data):
        """Build order totals section"""
        totals_data = [
            ['', '', 'Subtotal', f"₹{order_data['subtotal']:,.0f}"],
            ['', '', 'Shipping', f"₹{order_data['shipping_fee']:,.0f}"],
            ['', '', 'Handling', f"₹{order_data['handling_fee']:,.0f}"],
            ['', '', 'Tax (18% GST)', f"₹{order_data['tax']:,.0f}"],
            ['', '', 'TOTAL', f"₹{order_data['total']:,.0f}"],
        ]
        
        totals_table = Table(
            totals_data,
            colWidths=[1.5*inch, 1.5*inch, 1.5*inch, 1.5*inch]
        )
        totals_table.setStyle(TableStyle([
            ('ALIGN', (2, 0), (3, -1), 'RIGHT'),
            ('FONTNAME', (2, 0), (3, -2), 'Helvetica'),
            ('FONTNAME', (2, -1), (3, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (2, -1), (3, -1), 12),
            ('LINEABOVE', (2, -1), (3, -1), 2, colors.HexColor('#1F2937')),
            ('TOPPADDING', (2, -1), (3, -1), 8),
        ]))
        
        return totals_table

    def _build_footer(self, order_data):
        """Build footer with QR code and terms"""
        qr_bytes = self.generate_qr_code(order_data['order_number'])
        qr_image = Image(qr_bytes, width=1*inch, height=1*inch)
        
        footer_data = [
            [
                qr_image,
                Paragraph(
                    f"<b>Track Your Order</b><br/>"
                    f"Scan QR code or visit:<br/>"
                    f"hypevault.com/order/{order_data['order_number']}<br/><br/>"
                    f"<font size='8'>Thank you for your purchase!<br/>"
                    f"For support: support@hypevault.com<br/>"
                    f"Phone: +91-XXXX-XXXX-XXXX</font>",
                    self.styles['Normal']
                )
            ]
        ]
        
        footer_table = Table(footer_data, colWidths=[1.2*inch, 5*inch])
        footer_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (0, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
            ('LINEABOVE', (0, 0), (-1, 0), 1, colors.HexColor('#E5E7EB')),
            ('TOPPADDING', (0, 0), (-1, 0), 12),
        ]))
        
        return footer_table
