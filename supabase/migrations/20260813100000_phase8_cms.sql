-- ELIVA SCHOOL Phase 8 CMS
-- Execute in Supabase SQL Editor before using the CMS.

alter table public.courses
  add column if not exists title_fr text,
  add column if not exists title_ar text,
  add column if not exists short_description_fr text,
  add column if not exists short_description_ar text,
  add column if not exists hero_headline_fr text,
  add column if not exists hero_headline_ar text,
  add column if not exists modules_fr jsonb not null default '[]'::jsonb,
  add column if not exists modules_ar jsonb not null default '[]'::jsonb,
  add column if not exists faq_fr jsonb not null default '[]'::jsonb,
  add column if not exists faq_ar jsonb not null default '[]'::jsonb,
  add column if not exists study_modes text[] not null default '{}',
  add column if not exists wilayas text[] not null default '{}',
  add column if not exists price numeric(12,2),
  add column if not exists currency text default 'DZD',
  add column if not exists seats_available integer,
  add column if not exists next_session_date date,
  add column if not exists cover_image_path text,
  add column if not exists seo_title_fr text,
  add column if not exists seo_title_ar text,
  add column if not exists seo_description_fr text,
  add column if not exists seo_description_ar text,
  add column if not exists publish_status text not null default 'draft',
  add column if not exists display_order integer not null default 100,
  add column if not exists published_at timestamptz;

alter table public.trainers_crm
  add column if not exists is_public boolean not null default false,
  add column if not exists public_slug text,
  add column if not exists public_title_fr text,
  add column if not exists public_title_ar text,
  add column if not exists public_bio_fr text,
  add column if not exists public_bio_ar text,
  add column if not exists public_expertise_fr jsonb not null default '[]'::jsonb,
  add column if not exists public_expertise_ar jsonb not null default '[]'::jsonb,
  add column if not exists public_credentials_fr jsonb not null default '[]'::jsonb,
  add column if not exists public_credentials_ar jsonb not null default '[]'::jsonb,
  add column if not exists public_photo_path text,
  add column if not exists public_order integer not null default 100,
  add column if not exists public_seo_title_fr text,
  add column if not exists public_seo_title_ar text,
  add column if not exists public_seo_description_fr text,
  add column if not exists public_seo_description_ar text,
  add column if not exists public_published_at timestamptz;

create unique index if not exists trainers_public_slug_unique_idx on public.trainers_crm(public_slug) where public_slug is not null;
create index if not exists courses_publish_status_idx on public.courses(publish_status, display_order);
create index if not exists trainers_is_public_idx on public.trainers_crm(is_public, public_order);

alter table public.courses enable row level security;
alter table public.trainers_crm enable row level security;

drop policy if exists "public_read_courses" on public.courses;
create policy "public_read_courses" on public.courses for select to anon, authenticated using (publish_status = 'published');
drop policy if exists "public_read_public_trainers" on public.trainers_crm;
create or replace view public.public_trainers_cms
with (security_invoker = true) as
select id, full_name, public_slug, is_public, public_title_fr, public_title_ar,
       public_bio_fr, public_bio_ar, public_expertise_fr, public_expertise_ar,
       public_credentials_fr, public_credentials_ar, public_photo_path,
       public_order, public_seo_title_fr, public_seo_title_ar,
       public_seo_description_fr, public_seo_description_ar
from public.trainers_crm
where is_public = true;
revoke all on public.trainers_crm from anon;
grant select on public.public_trainers_cms to anon, authenticated;

-- Public-facing media buckets are readable; authenticated admins are the only writers.
insert into storage.buckets (id, name, public) values ('course-covers', 'course-covers', true) on conflict (id) do update set public = true;
insert into storage.buckets (id, name, public) values ('trainer-public', 'trainer-public', true) on conflict (id) do update set public = true;

-- Seed the five approved public trainers. Existing CRM fields remain untouched.
insert into public.trainers_crm (full_name, specialty, photo_url, public_slug, public_title_fr, public_title_ar, public_bio_fr, public_bio_ar, public_expertise_fr, public_expertise_ar, public_credentials_fr, public_credentials_ar, is_public, public_order)
values
('Djebbour Mohamed', 'Formation de formateurs', '/images/trainers/ChatGPT Image 11 août 2026, 15_39_45.png', 'djebbour-mohamed', 'Formateur international & expert commercial', 'مدرب دولي وخبير تجاري', 'Formateur international spécialisé dans la formation de formateurs et le développement des compétences commerciales.', 'مدرب دولي متخصص في تكوين المدربين وتطوير المهارات التجارية.', '["Prise de parole","Pédagogie pour adultes","Conception de formations"]', '["التحدث أمام الجمهور","بيداغوجيا الكبار","تصميم الدورات"]', '["Formateur international","Expert commercial"]', '["مدرب دولي","خبير تجاري"]', true, 1),
('Amina Mghizili', 'Tourisme & voyage', '/images/trainers/ChatGPT Image 11 août 2026, 15_40_27.png', 'amina-mghizili', 'Cadre marketing chez Air Algérie', 'إطار تسويقي لدى Air Algérie', 'Professionnelle du marketing dans le secteur aérien, elle partage une expérience de terrain utile aux professionnels du tourisme.', 'متخصصة في التسويق بقطاع الطيران وتشارك خبرة ميدانية مفيدة لمهنيي السياحة والسفر.', '["Marketing touristique","Transport aérien","Relation client"]', '["التسويق السياحي","النقل الجوي","علاقة العملاء"]', '["Cadre marketing chez Air Algérie"]', '["إطار تسويقي لدى Air Algérie"]', true, 2),
('Toufik Derdour', 'Photographie', '/images/trainers/ChatGPT Image 11 août 2026, 15_40_58.png', 'toufik-derdour', 'Formateur international en photographie', 'مدرب دولي في التصوير', 'Photographe et formateur international avec plus de 11 ans d’expérience dans la pratique de l’image.', 'مصور ومدرب دولي يملك أكثر من 11 سنة من الخبرة في مجال الصورة.', '["Studio","Photographie produit","Retouche"]', '["الاستوديو","تصوير المنتجات","المعالجة"]', '["Formateur international","Membre de la Fédération Internationale de la Photographie"]', '["مدرب دولي","عضو في الاتحاد الدولي للتصوير"]', true, 3),
('Safa Belkharchouche', 'Petite enfance', '/images/trainers/safa-belkharchouche.webp', 'safa-belkharchouche', 'Formatrice en petite enfance', 'مدربة في الطفولة المبكرة', 'Formatrice spécialisée dans la petite enfance, l’encadrement pédagogique et la gestion de crèche.', 'مدربة متخصصة في الطفولة المبكرة والتأطير التربوي وتسيير دور الحضانة.', '["Petite enfance","Encadrement pédagogique","Gestion de crèche"]', '["الطفولة المبكرة","التأطير التربوي","تسيير الحضانة"]', '["Formatrice en petite enfance"]', '["مدربة في الطفولة المبكرة"]', true, 4),
('Ilyes Belhay', 'E-commerce & marketing digital', '/images/trainers/ilyes-belhay.webp', 'ilyes-belhay', 'Formateur E-commerce & Marketing Digital', 'مدرب في التجارة الإلكترونية والتسويق الرقمي', 'Formateur spécialisé en e-commerce et marketing digital, avec plus de 9 ans d’expérience terrain.', 'مدرب متخصص في التجارة الإلكترونية والتسويق الرقمي، بخبرة ميدانية تتجاوز 9 سنوات.', '["Sourcing","Facebook Ads","TikTok Ads","IA"]', '["البحث عن المنتجات","Facebook Ads","TikTok Ads","الذكاء الاصطناعي"]', '["Plus de 9 ans d’expérience en e-commerce"]', '["أكثر من 9 سنوات من الخبرة في التجارة الإلكترونية"]', true, 5)
on conflict (id) do nothing;

insert into public.courses (title, slug, excerpt, is_active, title_fr, title_ar, short_description_fr, short_description_ar, study_modes, cover_image_path, trainer_id, publish_status, display_order, featured)
values
('Formation de Formateurs — TOT', 'formation-de-formateurs-tot', 'Devenez un formateur capable d’inspirer et transmettre avec impact.', true, 'Formation de Formateurs — TOT', 'تكوين المدربين — TOT', 'Plus de 30 heures de formation pratique intensive.', 'أكثر من 30 ساعة من التكوين العملي المكثف.', '{presentiel}', '/images/courses/tot.webp', (select id from public.trainers_crm where public_slug = 'djebbour-mohamed' limit 1), 'published', 1, true),
('Agent de Voyage & Gestion d’Agence', 'agent-de-voyage', 'Formation accélérée en ouverture et gestion d’une agence de voyage.', true, 'Agent de Voyage & Gestion d’Agence', 'وكيل سفر وتسيير وكالة', 'Une formation pratique pour maîtriser le métier et la gestion d’agence.', 'تكوين عملي لإتقان مهنة وكيل السفر وتسيير الوكالة.', '{presentiel}', '/images/courses/agent-voyage.webp', (select id from public.trainers_crm where public_slug = 'amina-mghizili' limit 1), 'published', 2, true),
('Formation Professionnelle en Photographie', 'photographie', 'De débutant à photographe prêt à pratiquer.', true, 'Formation Professionnelle en Photographie', 'التكوين المهني في التصوير', 'Studio, terrain, produits, retouche et business de la photographie.', 'الاستوديو والميدان والمنتجات والمعالجة ومشروع التصوير.', '{presentiel}', '/images/courses/photographie.webp', (select id from public.trainers_crm where public_slug = 'toufik-derdour' limit 1), 'published', 3, true),
('Petite Enfance — Formation 5 en 1', 'educatrice-enfants-gerante-creche', 'Cinq compétences complémentaires dans la petite enfance.', true, 'Petite Enfance — Formation 5 en 1', 'الطفولة المبكرة — 5 تكوينات في تكوين واحد', 'Un parcours pratique pour développer cinq compétences dans la petite enfance.', 'مسار عملي لتطوير خمس مهارات في مجال الطفولة المبكرة.', '{presentiel}', '/images/courses/petite-enfance.webp', (select id from public.trainers_crm where public_slug = 'safa-belkharchouche' limit 1), 'published', 4, true),
('E-commerce & Digital Marketing', 'ecommerce-marketing-digital', 'Construisez, lancez et développez votre activité e-commerce.', true, 'E-commerce & Digital Marketing', 'التجارة الإلكترونية والتسويق الرقمي', 'Plus de 30 heures de pratique intensive réparties sur un mois.', 'أكثر من 30 ساعة من التطبيق المكثف موزعة على شهر.', '{presentiel}', '/images/courses/ecommerce-digital-marketing.webp', (select id from public.trainers_crm where public_slug = 'ilyes-belhay' limit 1), 'published', 5, true)
on conflict (slug) do update set title_fr = excluded.title_fr, title_ar = excluded.title_ar, short_description_fr = excluded.short_description_fr, short_description_ar = excluded.short_description_ar, study_modes = excluded.study_modes, cover_image_path = excluded.cover_image_path, trainer_id = excluded.trainer_id, publish_status = excluded.publish_status, display_order = excluded.display_order, featured = excluded.featured, is_active = true;

-- Storage remains private. Authenticated admins can upload; public media is exposed through the app only after publication.
drop policy if exists "phase8_admin_storage_insert" on storage.objects;
create policy "phase8_admin_storage_insert" on storage.objects for insert to authenticated with check (bucket_id in ('course-covers','trainer-public'));
drop policy if exists "phase8_admin_storage_update" on storage.objects;
create policy "phase8_admin_storage_update" on storage.objects for update to authenticated using (bucket_id in ('course-covers','trainer-public')) with check (bucket_id in ('course-covers','trainer-public'));
drop policy if exists "phase8_public_storage_read" on storage.objects;
create policy "phase8_public_storage_read" on storage.objects for select to anon, authenticated using (bucket_id in ('course-covers','trainer-public'));
