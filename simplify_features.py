#!/usr/bin/env python3
"""
Script to simplify feature micropage files by removing showcase sections
and updating benefit card styles.
"""

import re
from pathlib import Path

def simplify_benefits_css(content):
    """Update benefits section CSS to match new requirements."""
    # Update benefit-card CSS
    benefit_card_old = re.compile(
        r'\.benefit-card\s*\{[^}]*\}',
        re.DOTALL
    )
    benefit_card_new = """        .benefit-card {
            background: #F8FAFC;
            border-radius: 16px;
            padding: 32px;
            text-align: center;
        }"""

    content = benefit_card_old.sub(benefit_card_new, content)

    # Update benefit-icon CSS (remove colored variations)
    # First remove all the color-specific icon styles
    content = re.sub(r'\.benefit-icon\.(blue|green|purple|orange|cyan|rose)\s*\{[^}]*\}', '', content)

    # Update main benefit-icon style
    benefit_icon_old = re.compile(
        r'\.benefit-icon\s*\{[^}]*\}',
        re.DOTALL
    )
    benefit_icon_new = """        .benefit-icon {
            width: 56px;
            height: 56px;
            background: rgba(0, 155, 213, 0.1);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 20px;
            color: var(--primary-main);
        }"""

    content = benefit_icon_old.sub(benefit_icon_new, content)

    # Update benefit-card h3
    h3_old = re.compile(
        r'\.benefit-card h3\s*\{[^}]*\}',
        re.DOTALL
    )
    h3_new = """        .benefit-card h3 {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 22px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.87);
            margin-bottom: 12px;
        }"""

    content = h3_old.sub(h3_new, content)

    # Update benefit-card p
    p_old = re.compile(
        r'\.benefit-card p\s*\{[^}]*\}',
        re.DOTALL
    )
    p_new = """        .benefit-card p {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 18px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.6);
            line-height: 1.6;
            margin: 0;
        }"""

    content = p_old.sub(p_new, content)

    # Add responsive styles for benefits if not present
    if '@media (max-width: 768px)' not in content or '.benefits-grid' not in content:
        # Find where to insert - after benefit-card p styles
        insert_pos = content.find('.benefit-card p {')
        if insert_pos > -1:
            # Find the closing brace
            insert_pos = content.find('}', insert_pos) + 1
            responsive_css = """

        @media (max-width: 768px) {
            .benefits-grid {
                grid-template-columns: 1fr;
            }
        }"""
            content = content[:insert_pos] + responsive_css + content[insert_pos:]

    return content

def update_cta_css(content):
    """Update CTA section CSS."""
    # Remove old CTA-related CSS (cta-section, btn-white, btn-ghost, etc.)
    # This is a complex pattern, so we'll do it in stages

    # Remove showcase and other complex section CSS
    patterns_to_remove = [
        r'/\*\s*Feature Showcase\s*\*/.*?(?=/\*|\.feature-cta|@media)',
        r'/\*\s*Showcase\s*\*/.*?(?=/\*|\.feature-cta|@media)',
        r'/\*\s*Screenshots?\s*\*/.*?(?=/\*|\.feature-cta|@media)',
        r'/\*\s*Workflow\s*\*/.*?(?=/\*|\.feature-cta|@media)',
        r'/\*\s*Risk Matrix\s*\*/.*?(?=/\*|\.feature-cta|@media)',
        r'/\*\s*Stats\s*\*/.*?(?=/\*|\.feature-cta|@media)',
        r'/\*\s*Donut\s*\*/.*?(?=/\*|\.feature-cta|@media)',
        r'\.showcase-[^{]*\{[^}]*\}',
        r'\.screenshot-[^{]*\{[^}]*\}',
        r'\.workflow-[^{]*\{[^}]*\}',
        r'\.risk-[^{]*\{[^}]*\}',
        r'\.stat-[^{]*\{[^}]*\}',
        r'\.donut-[^{]*\{[^}]*\}',
        r'\.legend-[^{]*\{[^}]*\}',
    ]

    for pattern in patterns_to_remove:
        content = re.sub(pattern, '', content, flags=re.DOTALL)

    # Add new CTA CSS if not present or update existing
    cta_css = """        /* CTA Section */
        .feature-cta {
            padding: 100px 0;
            background: rgba(0, 155, 213, 0.05);
        }

        .cta-content {
            text-align: center;
            max-width: 700px;
            margin: 0 auto;
        }

        .feature-cta h2 {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 44px;
            font-weight: 600;
            color: rgba(0, 0, 0, 0.87);
            margin-bottom: 16px;
        }

        .feature-cta p {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 18px;
            font-weight: 400;
            color: rgba(0, 0, 0, 0.6);
            margin-bottom: 40px;
        }"""

    # Look for existing CTA section or cta-section CSS
    if '.feature-cta' in content or '.cta-section' in content:
        # Replace existing
        content = re.sub(
            r'/\*\s*CTA.*?\*/.*?\.feature-cta.*?\}.*?\.feature-cta p\s*\{[^}]*\}',
            cta_css,
            content,
            flags=re.DOTALL
        )
        content = re.sub(
            r'\.cta-section.*?\}.*?\.cta-section p\s*\{[^}]*\}',
            cta_css.replace('.feature-cta', '.cta-section'),
            content,
            flags=re.DOTALL
        )

    return content

def remove_benefit_icon_classes(content):
    """Remove color classes from benefit-icon divs."""
    # Remove blue, green, purple, orange, cyan, rose classes
    content = re.sub(
        r'<div class="benefit-icon (blue|green|purple|orange|cyan|rose)">',
        r'<div class="benefit-icon">',
        content
    )
    # Also update icon sizes from 28 to 24
    content = re.sub(
        r'<svg[^>]*width="28" height="28"',
        r'<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"',
        content
    )
    return content

def remove_showcase_sections(content):
    """Remove all showcase, screenshot, workflow, and other extra sections."""
    # Find and remove sections between benefits and CTA
    # Pattern: </section> (benefits end) ... <section class="feature-cta"> or <section class="cta-section">

    # More targeted: remove specific sections
    patterns = [
        r'<section class="showcase-section">.*?</section>\s*',
        r'<section class="screenshots-section">.*?</section>\s*',
        r'<section class="screenshot-section">.*?</section>\s*',
        r'<section class="workflow-section">.*?</section>\s*',
        r'<section class="risk-matrix-section">.*?</section>\s*',
        r'<!--\s*Showcase.*?-->\s*<section.*?</section>\s*',
        r'<!--\s*Screenshot.*?-->\s*<section.*?</section>\s*',
        r'<!--\s*Workflow.*?-->\s*<section.*?</section>\s*',
        r'<!--\s*Risk Matrix.*?-->\s*<section.*?</section>\s*',
    ]

    for pattern in patterns:
        content = re.sub(pattern, '', content, flags=re.DOTALL | re.IGNORECASE)

    return content

def update_cta_html(content):
    """Update CTA section HTML."""
    cta_new = """    <!-- CTA Section -->
    <section class="feature-cta">
        <div class="container">
            <div class="cta-content">
                <h2>Ready to get started?</h2>
                <p>Join leading companies using Inspektra for electrical safety management.</p>
                <a href="../contact.html" class="btn btn-primary btn-lg">Request Access</a>
            </div>
        </div>
    </section>"""

    # Replace existing CTA sections
    patterns = [
        r'<!--\s*CTA.*?-->\s*<section class="(feature-)?cta(-section)?".*?</section>',
        r'<section class="(feature-)?cta(-section)?".*?</section>',
    ]

    for pattern in patterns:
        content = re.sub(pattern, cta_new, content, count=1, flags=re.DOTALL)

    return content

def simplify_file(filepath):
    """Simplify a single feature file."""
    print(f"Processing {filepath.name}...")

    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Apply transformations
    content = simplify_benefits_css(content)
    content = update_cta_css(content)
    content = remove_benefit_icon_classes(content)
    content = remove_showcase_sections(content)
    content = update_cta_html(content)

    # Write back
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f"✓ {filepath.name} simplified")

def main():
    """Main function to process all feature files."""
    features_dir = Path('/workspaces/crocodile/features')

    files = [
        'assets.html',
        'locations.html',
        'inspections.html',
        'risk-assessments.html',
        'tasks.html',
        'home-office-checks.html',
        'monitoring.html',
    ]

    for filename in files:
        filepath = features_dir / filename
        if filepath.exists():
            try:
                simplify_file(filepath)
            except Exception as e:
                print(f"✗ Error processing {filename}: {e}")
        else:
            print(f"✗ {filename} not found")

    print("\nAll files processed!")

if __name__ == '__main__':
    main()
