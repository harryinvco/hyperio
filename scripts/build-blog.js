const fs = require('fs');
const path = require('path');
const { marked } = require('marked');
const frontMatter = require('front-matter');

const BLOG_CONTENT_DIR = path.join(__dirname, '../content/blog');
const WEBINAR_CONTENT_DIR = path.join(__dirname, '../content/webinars');
const ACADEMY_CONTENT_DIR = path.join(__dirname, '../content/academy');

const BLOG_OUTPUT_DIR = path.join(__dirname, '../blog');
const WEBINAR_OUTPUT_DIR = path.join(__dirname, '../webinars');
const ACADEMY_OUTPUT_DIR = path.join(__dirname, '../academy');

const TEMPLATES_DIR = path.join(__dirname, '../templates');

// Ensure output directories exist
[BLOG_OUTPUT_DIR, WEBINAR_OUTPUT_DIR, ACADEMY_OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

// Read templates
const layoutTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'layout.html'), 'utf-8');
const postTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'blog-post.html'), 'utf-8');
const indexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'blog-index.html'), 'utf-8');
const webinarsTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'webinars.html'), 'utf-8');
const academyIndexTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'academy-index.html'), 'utf-8');
const academyArticleTemplate = fs.readFileSync(path.join(TEMPLATES_DIR, 'academy-article.html'), 'utf-8');

// Helper to render template
function render(template, data) {
    let output = template;
    for (const key in data) {
        // Simple replacement, handling potential undefined values
        const value = data[key] !== undefined ? data[key] : '';
        output = output.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return output;
}

// --- BLOG BUILD ---
console.log('Building Blog...');
const posts = fs.readdirSync(BLOG_CONTENT_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => {
        const content = fs.readFileSync(path.join(BLOG_CONTENT_DIR, file), 'utf-8');
        const { attributes, body } = frontMatter(content);
        const htmlBody = marked.parse(body);
        
        return {
            ...attributes,
            body: htmlBody,
            slug: file.replace('.md', ''),
            dateObj: new Date(attributes.date)
        };
    })
    .sort((a, b) => b.dateObj - a.dateObj);

// Generate individual posts
posts.forEach(post => {
    const postContent = render(postTemplate, {
        title: post.title,
        date: post.dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
        author: post.author,
        image: post.image,
        body: post.body
    });

    const fullHtml = render(layoutTemplate, {
        title: post.title,
        description: post.description,
        content: postContent
    });

    fs.writeFileSync(path.join(BLOG_OUTPUT_DIR, `${post.slug}.html`), fullHtml);
});

// Generate blog index
const featuredPost = posts[0];
const otherPosts = posts.slice(1);

const featuredPostHtml = featuredPost ? `
    <a href="${featuredPost.slug}.html" class="featured-post-card">
        <div class="featured-post-image" style="background-image: url('${featuredPost.image}')"></div>
        <div class="featured-post-content">
            <div class="featured-badge">Latest Article</div>
            <h2 class="featured-post-title">${featuredPost.title}</h2>
            <p class="featured-post-excerpt">${featuredPost.description}</p>
            <div class="featured-post-meta">
                ${featuredPost.dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • ${featuredPost.author}
            </div>
        </div>
    </a>
` : '';

const postsHtml = otherPosts.map(post => `
    <a href="${post.slug}.html" class="blog-card">
        <div class="blog-card-image" style="background-image: url('${post.image}')"></div>
        <div class="blog-card-content">
            <div class="blog-card-title">${post.title}</div>
            <div class="blog-card-excerpt">${post.description}</div>
            <div class="blog-card-meta">
                ${post.dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} • ${post.author}
            </div>
        </div>
    </a>
`).join('');

const indexContent = render(indexTemplate, {
    featuredPost: featuredPostHtml,
    posts: postsHtml
});

const fullIndexHtml = render(layoutTemplate, {
    title: 'Blog',
    description: 'Latest insights and updates from Inspektra',
    content: indexContent
});

fs.writeFileSync(path.join(BLOG_OUTPUT_DIR, 'index.html'), fullIndexHtml);
console.log('Blog built successfully.');


// --- WEBINARS BUILD ---
console.log('Building Webinars...');
const episodes = fs.readdirSync(WEBINAR_CONTENT_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => {
        const content = fs.readFileSync(path.join(WEBINAR_CONTENT_DIR, file), 'utf-8');
        const { attributes, body } = frontMatter(content);
        const htmlBody = marked.parse(body);
        
        return {
            ...attributes,
            body: htmlBody, // We need the body for the description area
            slug: file.replace('.md', ''),
            dateObj: new Date(attributes.date)
        };
    })
    .sort((a, b) => b.dateObj - a.dateObj);

// Generate Episode List HTML
const episodeListHtml = episodes.map((ep, index) => `
    <div class="episode-list-item ${index === 0 ? 'active' : ''}" onclick="loadEpisodeDetails(${index})">
        <div class="episode-thumb-small" style="background-image: url('${ep.image}')"></div>
        <div class="episode-info-small">
            <h4>${ep.title}</h4>
            <p>${ep.type} • ${ep.duration}</p>
        </div>
    </div>
`).join('');

// Latest Episode Data
const latestEp = episodes[0] || {};

const webinarsHtml = render(webinarsTemplate, {
    episode_list_html: episodeListHtml,
    episodes_json: JSON.stringify(episodes),
    latest_title: latestEp.title,
    latest_type: latestEp.type,
    latest_guest: latestEp.guest,
    latest_date: latestEp.dateObj ? latestEp.dateObj.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '',
    latest_duration: latestEp.duration,
    latest_image: latestEp.image,
    latest_audio: latestEp.audio_url,
    latest_body: latestEp.body
});

fs.writeFileSync(path.join(WEBINAR_OUTPUT_DIR, 'index.html'), webinarsHtml);
console.log('Webinars built successfully.');


// --- ACADEMY BUILD ---
console.log('Building Academy...');

const categories = ['guides', 'tutorials'];
const academyData = {};

categories.forEach(category => {
    const catDir = path.join(ACADEMY_CONTENT_DIR, category);
    if (!fs.existsSync(catDir)) return;

    const articles = fs.readdirSync(catDir)
        .filter(file => file.endsWith('.md'))
        .map(file => {
            const content = fs.readFileSync(path.join(catDir, file), 'utf-8');
            const { attributes, body } = frontMatter(content);
            const htmlBody = marked.parse(body);
            
            return {
                ...attributes,
                body: htmlBody,
                slug: file.replace('.md', ''),
                category: category, // Store folder name as category key
                categoryDisplay: attributes.category // Store display name from frontmatter
            };
        })
        .sort((a, b) => (a.order || 99) - (b.order || 99));

    academyData[category] = articles;

    // Generate individual article pages
    articles.forEach((article, index) => {
        // Generate sidebar links for this category
        const sidebarLinks = articles.map(a => 
            `<a href="${a.slug}.html" class="sidebar-link ${a.slug === article.slug ? 'active' : ''}">${a.title}</a>`
        ).join('');

        // Next Lesson Logic
        const nextArticle = articles[index + 1];
        const nextLessonButton = nextArticle 
            ? `<a href="${nextArticle.slug}.html" class="btn-next-lesson">
                 <span>Next: ${nextArticle.title}</span>
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
               </a>`
            : '';

        // Video Player Logic
        const videoPlayer = article.video_url 
            ? `<div class="academy-video-container">
                 <iframe src="${article.video_url}" allowfullscreen></iframe>
               </div>`
            : '';

        const articleHtml = render(academyArticleTemplate, {
            title: article.title,
            description: article.description,
            category: article.categoryDisplay,
            body: article.body,
            sidebar_links: sidebarLinks,
            next_lesson_button: nextLessonButton,
            video_player: videoPlayer
        });

        // Ensure category output dir exists
        const catOutputDir = path.join(ACADEMY_OUTPUT_DIR, category);
        if (!fs.existsSync(catOutputDir)) {
            fs.mkdirSync(catOutputDir, { recursive: true });
        }

        fs.writeFileSync(path.join(catOutputDir, `${article.slug}.html`), articleHtml);
    });
});

// Generate Academy Index
function generateCategoryGrid(articles, folderName) {
    if (!articles) return '';
    return articles.map(article => `
        <a href="${folderName}/${article.slug}.html" class="academy-card">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <div class="academy-card-meta">
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <span>${article.duration || '5 min'}</span>
                </div>
                <div class="meta-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                    <span>${article.level || 'Beginner'}</span>
                </div>
                <div class="card-arrow">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </div>
            </div>
        </a>
    `).join('');
}

const academyIndexHtml = render(academyIndexTemplate, {
    guides_html: generateCategoryGrid(academyData['guides'], 'guides'),
    tutorials_html: generateCategoryGrid(academyData['tutorials'], 'tutorials')
});

fs.writeFileSync(path.join(ACADEMY_OUTPUT_DIR, 'index.html'), academyIndexHtml);
console.log('Academy built successfully.');

