-- Portrait Styles (Cartoon styles)
INSERT INTO public.portrait_styles (slug, name, description, example_image_url, price_multiplier, is_active) VALUES
('rick-and-morty', 'Rick and Morty', 'Sci-fi cartoon style with unique character designs', '/images/styles/rick-and-morty.jpg', 1.0, true),
('gravity-falls', 'Gravity Falls', 'Mystery adventure style with distinctive Western aesthetic', '/images/styles/gravity-falls.jpg', 1.1, true),
('simpsons', 'Simpsons', 'Classic yellow-skinned animation style', '/images/styles/simpsons.jpg', 1.0, true),
('fairly-odd-parents', 'Fairly OddParents', 'Bright, colorful magical comedy style', '/images/styles/fairly-odd-parents.jpg', 1.15, true);

-- Backgrounds for Rick and Morty style
INSERT INTO public.backgrounds (slug, name, description, thumbnail_url, is_active) VALUES
-- Rick and Morty backgrounds
('ram-space-ship', 'Space Ship Interior', 'Inside the iconic futuristic spaceship', '/images/bg/ram-space-ship.jpg', true),
('ram-rick-lab', 'Rick''s Laboratory', 'Portal-filled laboratory filled with scientific equipment', '/images/bg/ram-rick-lab.jpg', true),
('ram-planet', 'Alien Planet', 'Colorful alien landscape with strange flora', '/images/bg/ram-planet.jpg', true),
('ram-earth-garage', 'Garage (Earth)', 'The modest garage where adventures begin', '/images/bg/ram-earth-garage.jpg', true),
('ram-space', 'Deep Space', 'Starry outer space with nebulas and stars', '/images/bg/ram-space.jpg', true),
('ram-portal', 'Portal Background', 'Energy portal effect background', '/images/bg/ram-portal.jpg', true),

-- Gravity Falls backgrounds
('gf-gravity-falls-town', 'Gravity Falls Town', 'Mysterious forest town with wooden structures', '/images/bg/gf-town.jpg', true),
('gf-mystery-shack', 'Mystery Shack', 'The iconic tourist attraction building', '/images/bg/gf-mystery-shack.jpg', true),
('gf-forest', 'Dark Forest', 'Dense woodland with mysterious atmosphere', '/images/bg/gf-forest.jpg', true),
('gf-cave', 'Underground Cave', 'Cavern filled with crystals and secrets', '/images/bg/gf-cave.jpg', true),
('gf-waterfall', 'Waterfall', 'Scenic waterfall in the forest', '/images/bg/gf-waterfall.jpg', true),
('gf-dimension', 'Nightmare Dimension', 'Twisted, surreal dimension background', '/images/bg/gf-dimension.jpg', true),

-- Simpsons backgrounds
('simp-living-room', 'Simpson Home Living Room', 'The iconic couch and living room setting', '/images/bg/simp-living-room.jpg', true),
('simp-springfield', 'Springfield Street', 'Main street of Springfield with shops and buildings', '/images/bg/simp-springfield.jpg', true),
('simp-nrg', 'Nuclear Power Plant', 'Industrial nuclear facility where Homer works', '/images/bg/simp-nrg.jpg', true),
('simp-moes', 'Moe''s Tavern', 'The local bar where regulars hang out', '/images/bg/simp-moes.jpg', true),
('simp-kwikeemart', 'Kwik-E-Mart', 'The convenience store on the corner', '/images/bg/simp-kwikeemart.jpg', true),
('simp-school', 'Springfield Elementary', 'The school building exterior', '/images/bg/simp-school.jpg', true),

-- Fairly OddParents backgrounds
('fop-dimmsdale', 'Dimmsdale Street', 'Suburban neighborhood street', '/images/bg/fop-dimmsdale.jpg', true),
('fop-home', 'Cosmo and Wanda''s Home', 'The fairy godparents'' magical living space', '/images/bg/fop-home.jpg', true),
('fop-fairy-world', 'Fairy World', 'Magical fairy realm with fantastical elements', '/images/bg/fop-fairy-world.jpg', true),
('fop-clouds', 'Cloud City', 'Fluffy clouds and sky background', '/images/bg/fop-clouds.jpg', true),
('fop-classroom', 'School Classroom', 'Dimmsdale Elementary classroom', '/images/bg/fop-classroom.jpg', true),
('fop-magical', 'Magical Sparkles', 'Glowing magical effect background', '/images/bg/fop-magical.jpg', true),

-- Generic backgrounds (work for all styles)
('generic-clouds', 'Cloud Background', 'Simple white clouds on blue sky', '/images/bg/generic-clouds.jpg', true),
('generic-gradient', 'Color Gradient', 'Smooth color gradient background', '/images/bg/generic-gradient.jpg', true),
('generic-transparent', 'Transparent', 'No background (transparent)', '/images/bg/generic-transparent.jpg', true);
