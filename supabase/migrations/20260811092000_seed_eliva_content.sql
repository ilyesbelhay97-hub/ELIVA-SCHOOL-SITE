insert into public.categories (name, slug, description, sort_order)
values
  ('Business & e-commerce', 'business-ecommerce', 'Transformer une idée en activité concrète.', 1),
  ('Marketing digital', 'marketing-digital', 'Développer une présence utile et cohérente.', 2),
  ('Formation de formateurs', 'formation-formateurs', 'Structurer et animer des formations mémorables.', 3)
on conflict (slug) do update set name = excluded.name, description = excluded.description, sort_order = excluded.sort_order;

insert into public.courses (title, slug, excerpt, description, category_id, format, status, featured)
select values_table.title, values_table.slug, values_table.excerpt, values_table.description, categories.id, values_table.format, 'published', values_table.featured
from (values
  ('Lancer son activité en ligne', 'lancer-activite-en-ligne', 'De l’idée à votre première offre claire et vendable.', 'Un parcours pratique pour clarifier votre offre, définir votre client et poser les premières bases de votre activité.', 'business-ecommerce', 'presentiel', true),
  ('Social media qui convertit', 'social-media-qui-convertit', 'Construire une présence utile, cohérente et mesurable.', 'Apprenez à organiser votre contenu, comprendre votre audience et transformer votre présence en ligne en véritable levier.', 'marketing-digital', 'en_ligne', true),
  ('Train the Trainer', 'train-the-trainer', 'Structurer, animer et évaluer des formations mémorables.', 'Un programme pour gagner en méthode, en clarté et en impact lorsque vous transmettez vos compétences.', 'formation-formateurs', 'presentiel', true)
) as values_table(title, slug, excerpt, description, category_slug, format, featured)
join public.categories on categories.slug = values_table.category_slug
on conflict (slug) do update set title = excluded.title, excerpt = excluded.excerpt, description = excluded.description, category_id = excluded.category_id, format = excluded.format, status = 'published', featured = excluded.featured;

insert into public.course_sessions (course_id, city, start_date, duration_label, registration_open, featured)
select courses.id, sessions.city, sessions.start_date::timestamptz, sessions.duration_label, true, true
from (values
  ('lancer-activite-en-ligne', 'Skikda', '2026-09-05T09:00:00+01:00', '3 jours'),
  ('social-media-qui-convertit', 'En ligne', '2026-09-12T18:00:00+01:00', '4 semaines'),
  ('train-the-trainer', 'Constantine', '2026-09-19T09:00:00+01:00', '5 jours')
) as sessions(course_slug, city, start_date, duration_label)
join public.courses on courses.slug = sessions.course_slug
where not exists (
  select 1 from public.course_sessions existing
  where existing.course_id = courses.id and existing.start_date = sessions.start_date::timestamptz
);
