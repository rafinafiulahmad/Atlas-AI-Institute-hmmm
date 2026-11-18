import 'dotenv/config';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 3000;

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  execFileSync(process.execPath, [path.join(__dirname, 'scripts', 'build-static.mjs')], {
    cwd: __dirname,
    stdio: 'inherit',
  });
}

const app = express();
app.disable('x-powered-by');

app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  next();
});

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

const storageDir = path.join(__dirname, 'storage');
const applicationsFile = path.join(storageDir, 'applications.json');

function ensureStorage() {
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }
  if (!fs.existsSync(applicationsFile)) {
    fs.writeFileSync(applicationsFile, JSON.stringify({ applications: [] }, null, 2), 'utf8');
  }
}

function getApplications(): any[] {
  ensureStorage();
  try {
    const raw = fs.readFileSync(applicationsFile, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed?.applications) ? parsed.applications : [];
  } catch {
    return [];
  }
}

function saveApplications(apps: any[]) {
  ensureStorage();
  fs.writeFileSync(applicationsFile, JSON.stringify({ applications: apps }, null, 2), 'utf8');
}

function countWords(str: string): number {
  return (str || '').trim().split(/\s+/).filter(Boolean).length;
}

// Membership Application submission endpoint
app.post('/api/membership/apply', async (req, res) => {
  try {
    const b = req.body || {};
    const fullName = String(b.full_name || b.name || '').trim();
    const email = String(b.email || '').trim().toLowerCase();
    const country = String(b.country || '').trim();
    const city = String(b.city || '').trim();
    const designation = String(b.designation || '').trim();
    const organization = String(b.organization || '').trim();
    const organizationWebsite = String(b.organization_website || '').trim();
    const linkedinUrl = String(b.linkedin_url || '').trim();
    const websiteUrl = String(b.website_url || '').trim();
    const biography = String(b.biography || '').trim();
    const currentRole = String(b.current_role_responsibilities || '').trim();

    let expertiseAreas: string[] = [];
    if (Array.isArray(b.expertise_areas)) {
      expertiseAreas = b.expertise_areas.map((x: any) => String(x).trim()).filter(Boolean);
    } else if (typeof b.expertise_areas === 'string') {
      expertiseAreas = b.expertise_areas.split(',').map((x: string) => x.trim()).filter(Boolean);
    }
    const expertiseOther = String(b.expertise_other || '').trim();
    if (expertiseOther && !expertiseAreas.includes('Other')) {
      expertiseAreas.push(`Other: ${expertiseOther}`);
    }

    const experienceYears = String(b.experience_years || '').trim();
    const keyResearchInterests = String(b.key_research_interests || '').trim();
    const publicationsPapersProjects = String(b.publications_papers_projects || '').trim();

    let contributionAreas: string[] = [];
    if (Array.isArray(b.contribution_areas)) {
      contributionAreas = b.contribution_areas.map((x: any) => String(x).trim()).filter(Boolean);
    } else if (typeof b.contribution_areas === 'string') {
      contributionAreas = b.contribution_areas.split(',').map((x: string) => x.trim()).filter(Boolean);
    }
    const contributionOther = String(b.contribution_other || '').trim();
    if (contributionOther && !contributionAreas.includes('Other')) {
      contributionAreas.push(`Other: ${contributionOther}`);
    }

    const linksToWork = String(b.links_to_work || '').trim();
    const motivation = String(b.motivation || '').trim();
    const perspectivesAndExpertise = String(b.perspectives_and_expertise || '').trim();
    const contributionPlan = String(b.contribution_plan || '').trim();
    const collaborativeInterest = String(b.collaborative_research_interest || 'Yes').trim();

    // Required fields validation
    if (!fullName || !email || !country || !designation || !organization || !linkedinUrl) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required personal information fields (*).'
      });
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid professional email address.'
      });
    }

    // URL format validation for LinkedIn
    if (!/^https?:\/\//i.test(linkedinUrl)) {
      return res.status(400).json({
        success: false,
        error: 'LinkedIn profile must be a valid URL starting with http:// or https://'
      });
    }

    // Word count validations
    const bioWords = countWords(biography);
    if (bioWords < 100 || bioWords > 300) {
      return res.status(400).json({
        success: false,
        error: `Professional Biography must be between 100 and 300 words. Currently: ${bioWords} words.`
      });
    }

    const motivationWords = countWords(motivation);
    if (motivationWords < 100) {
      return res.status(400).json({
        success: false,
        error: `Motivation statement must be at least 100 words. Currently: ${motivationWords} words.`
      });
    }

    if (!currentRole || !keyResearchInterests || !perspectivesAndExpertise || !contributionPlan) {
      return res.status(400).json({
        success: false,
        error: 'Please complete all required professional background, research, and contribution statements (*).'
      });
    }

    if (!expertiseAreas.length) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one primary area of expertise.'
      });
    }

    if (!contributionAreas.length) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one area where you can contribute to the Coalition.'
      });
    }

    // Declarations
    const dAccuracy = Boolean(b.declaration_accuracy === true || b.declaration_accuracy === 'on' || b.declaration_accuracy === 'true');
    const dNoGuarantee = Boolean(b.declaration_no_guarantee === true || b.declaration_no_guarantee === 'on' || b.declaration_no_guarantee === 'true');
    const dPrivacy = Boolean(b.declaration_privacy === true || b.declaration_privacy === 'on' || b.declaration_privacy === 'true');

    if (!dAccuracy || !dNoGuarantee || !dPrivacy) {
      return res.status(400).json({
        success: false,
        error: 'All three declaration and consent confirmations are required to submit.'
      });
    }

    // Prevent duplicate submissions: check if pending application with same email already exists
    const existing = getApplications();
    const duplicate = existing.find((a: any) => a.email === email && a.status === 'Pending Review');
    if (duplicate) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        error: 'An application with this email address has already been received and is currently Pending Review.'
      });
    }

    const appId = `AGPC-APP-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const submittedAt = new Date().toISOString();

    const applicationRecord = {
      id: appId,
      submitted_at: submittedAt,
      status: 'Pending Review',
      membership_category: 'Member', // All applicants apply under the general pathway; category managed administratively
      full_name: fullName,
      email,
      country,
      city,
      designation,
      organization,
      organization_website: organizationWebsite,
      linkedin_url: linkedinUrl,
      website_url: websiteUrl,
      biography,
      biography_word_count: bioWords,
      current_role_responsibilities: currentRole,
      expertise_areas: expertiseAreas,
      expertise_other: expertiseOther,
      experience_years: experienceYears,
      key_research_interests: keyResearchInterests,
      publications_papers_projects: publicationsPapersProjects,
      contribution_areas: contributionAreas,
      contribution_other: contributionOther,
      links_to_work: linksToWork,
      motivation,
      motivation_word_count: motivationWords,
      perspectives_and_expertise: perspectivesAndExpertise,
      contribution_plan: contributionPlan,
      collaborative_research_interest: collaborativeInterest,
      declarations: {
        accuracy_confirmed: dAccuracy,
        no_guarantee_understood: dNoGuarantee,
        privacy_policy_accepted: dPrivacy
      },
      reviewed_by: null,
      reviewed_at: null,
      review_notes: ''
    };

    existing.unshift(applicationRecord);
    saveApplications(existing);

    // Optional: If not already submitted directly from the browser, notify Web3Forms asynchronously
    if (!b.browser_web3forms_handled) {
      const w3fKey = process.env.WEB3FORMS_ACCESS_KEY || 'fedcf2cc-8d00-4d6e-9fe3-3dece7d18c82';
      fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: w3fKey,
          subject: `New Membership Application: ${fullName} (${country})`,
          from_name: 'Atlas Coalition Applications',
          application_id: appId,
          name: fullName,
          email,
          designation,
          organization,
          country,
          membership_category: 'Member',
          status: 'Pending Review'
        })
      }).catch(() => {});
    }

    return res.status(201).json({
      success: true,
      applicationId: appId,
      submittedAt,
      message: 'Your application has been received and will be reviewed manually by the Coalition team.'
    });
  } catch (err: any) {
    console.error('Application submission error:', err);
    return res.status(500).json({
      success: false,
      error: 'An unexpected error occurred while processing your application. Please try again later.'
    });
  }
});

// Admin Review Endpoints (Protected by ADMIN_API_KEY)
function checkAdminAuth(req: express.Request): boolean {
  const adminKey = process.env.ADMIN_API_KEY || 'atlas-admin-2026';
  const providedKey = req.headers['x-admin-key'] || req.query.admin_key || (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.slice(7) : '');
  return Boolean(providedKey && providedKey === adminKey);
}

app.get('/api/admin/applications', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized administrative access' });
  }
  const apps = getApplications();
  return res.json({
    total: apps.length,
    pending: apps.filter(a => a.status === 'Pending Review').length,
    applications: apps
  });
});

app.patch('/api/admin/applications/:id', (req, res) => {
  if (!checkAdminAuth(req)) {
    return res.status(401).json({ error: 'Unauthorized administrative access' });
  }
  const { id } = req.params;
  const { status, membership_category, review_notes, reviewed_by } = req.body || {};
  const apps = getApplications();
  const index = apps.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Application not found' });
  }
  if (status) apps[index].status = status;
  if (membership_category) apps[index].membership_category = membership_category;
  if (review_notes !== undefined) apps[index].review_notes = review_notes;
  apps[index].reviewed_by = reviewed_by || 'Administrator';
  apps[index].reviewed_at = new Date().toISOString();
  saveApplications(apps);
  return res.json({ success: true, application: apps[index] });
});

app.get('/web3forms-config.js', (_req, res) => {
  const membershipKey = process.env.WEB3FORMS_MEMBERSHIP_ACCESS_KEY || process.env.WEB3FORMS_ACCESS_KEY || 'fedcf2cc-8d00-4d6e-9fe3-3dece7d18c82';
  const lines = [
    `window.WEB3FORMS_ACCESS_KEY = ${JSON.stringify(process.env.WEB3FORMS_ACCESS_KEY || '')};`,
    `window.WEB3FORMS_MEMBERSHIP_ACCESS_KEY = ${JSON.stringify(membershipKey)};`,
    `window.WEB3FORMS_PUBLICATION_ACCESS_KEY = ${JSON.stringify(process.env.WEB3FORMS_PUBLICATION_ACCESS_KEY || '')};`,
  ];
  if (process.env.WEB3FORMS_NEWSLETTER_ENDPOINT) {
    lines.push(`window.WEB3FORMS_NEWSLETTER_ENDPOINT = ${JSON.stringify(process.env.WEB3FORMS_NEWSLETTER_ENDPOINT)};`);
  }
  if (process.env.WEB3FORMS_NEWSLETTER_ACCESS_KEY) {
    lines.push(`window.WEB3FORMS_NEWSLETTER_ACCESS_KEY = ${JSON.stringify(process.env.WEB3FORMS_NEWSLETTER_ACCESS_KEY)};`);
  }
  res.type('application/javascript; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.send(lines.join('\n') + '\n');
});

app.use(
  express.static(distDir, {
    dotfiles: 'allow',
    index: 'index.html',
  }),
);

app.use((req, res) => {
  const reqPath = req.path || '/';
  const normalized = reqPath.replace(/^\/+|\/+$/g, '');
  if (normalized) {
    const candidateIndex = path.join(distDir, normalized, 'index.html');
    if (candidateIndex.startsWith(distDir) && fs.existsSync(candidateIndex)) {
      return res.sendFile(candidateIndex);
    }
    const ext = path.extname(reqPath);
    if (ext && ext !== '.html') {
      return res.status(404).send('Not found');
    }
  }
  const fallbackIndex = path.join(distDir, 'index.html');
  if (fs.existsSync(fallbackIndex)) {
    return res.sendFile(fallbackIndex);
  }
  return res.status(404).sendFile(path.join(distDir, '404.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Atlas Global South AI Policy Coalition server listening on http://0.0.0.0:${port}`);
});
