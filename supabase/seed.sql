begin;
insert into public.badges (id,title,required_correct) values
('first-step','Le premier pas',0),('first-click','Premier déclic',1),('momentum','Sur ta lancée',5),('confidence','La confiance',15)
on conflict (id) do nothing;

-- Modules de découverte, sans prétention de couverture intégrale du programme belge.
insert into public.chapters (slug,title,school_year,position,published) values
('2-nombres','Nombres & calculs',2,1,true),
('2-algebre','Algèbre',2,2,true),
('2-geometrie','Géométrie',2,3,true)
on conflict (slug) do nothing;

insert into public.lessons (chapter_id,slug,title,theory,analogy,common_mistake,exercise_kind,published)
select id,'fractions-meme-denominateur','Additionner des fractions',
'Pour additionner deux fractions de même dénominateur, additionne les numérateurs et conserve le dénominateur.',
'Une pizza est découpée en parts égales. Deux parts plus trois parts donnent cinq parts. La taille des parts ne change pas.',
'Ne pas additionner les dénominateurs.','fractions',true
from public.chapters where slug='2-nombres'
on conflict (slug) do nothing;
insert into public.lessons (chapter_id,slug,title,theory,analogy,common_mistake,exercise_kind,published)
select id,'equation-additive','Trouver la valeur de x',
'Pour résoudre x + a = b, soustrais a des deux côtés : x = b − a.',
'Une équation est une balance. Retirer le même poids de chaque plateau préserve son équilibre.',
'Ne jamais modifier un seul côté de l’égalité.','equations',true
from public.chapters where slug='2-algebre'
on conflict (slug) do nothing;
insert into public.lessons (chapter_id,slug,title,theory,analogy,common_mistake,exercise_kind,published)
select id,'aire-rectangle','Calculer une aire',
'L’aire du rectangle vaut longueur × largeur. Avec des longueurs en mètres, elle se mesure en mètres carrés.',
'Compte les rangées de carreaux de 1 m², puis multiplie par le nombre de carreaux dans chaque rangée.',
'Ne pas confondre aire et périmètre.','geometry',true
from public.chapters where slug='2-geometrie'
on conflict (slug) do nothing;
commit;
