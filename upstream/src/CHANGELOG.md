* version alpha 4 - 15/09/2014

- Ajout de l'internationalisation
- Changement de nom de l'application
- relooking des boutons de l'interface de génération des IAs
- Ajout d'une fenêtre "paramètres" qui sera enrichie par la suite.
Actuellement, elle ne propose qu'une seule option. Vous pouvez contrôler
la qualité de l'image rendue.
- Réduction du Critical Rendering Path
- Minification des CSS et des JS.
- Désormais, les images de fond dans inkscape n'ont plus besoin d'être
alignées dans le coin supérieur gauche. La gestion des calques a
également été améliorée.
- Ajout d'une nouvelle fonctionnalité dans les images actives : les
LIENS DIRECTS. Pour cela, il suffit de mettre un lien absolu ou relatif 
dans le titre du détail.
- Tous les fichiers utiles pour créer une app Firefox OS sont désormais
installés par défaut dans chaque IA générée
- Via les metadonnées opengraph, les IA générées peuvent être affichées
dans les réseaux sociaux (Facebook, twitter...)
- Grosse amélioration du drag and drop sur le thème gameDragAndDrop
- Les images dans game1clic réagissent uniquement sur les pixels opaques
(comme pour gameDrag&Drop)
- Mise en cache des images pour accélérer le traitement dans gameDragAndDrop et
game1clic
- ajout d'un lanceur executable pour Windows

* version alpha 3 - 02/07/2014

- Ajout d'une popup durant la génération d'une image active
- L'image de fond n'est plus estompée durant la lecture de la description 
générale
- L'image de fond est embarquée même si elle est liée dans Inkscape
- pikipiki : ajout des liens hypertexte
- Conservation des chemins vers source et destination pour génération des 
images actives
- Améliorations importantes du packaging
- Images persistantes si elles ont un fond blanc
- Masquage des fichiers cachés lors de la recherche d'un fichier svg dans 
le filesystem
- tests unitaires ajoutés
- tests fonctionnels sur les thèmes ajoutés
- Ajout de la gestion des metadonnées
- popup disponible dans les thèmes pour afficher les metadonnées
- Ajout des thèmes popBlue, popYellow, audioBlue, buttonBlue
- Ajout des bordures sur les détourages

* version alpha 2 - 30/04/2014

- L'outil standalone est packagé pour debian (François Lafont)
- Grosse optimisation du moteur html5 pour qu'il gère les images actives de 
grande taille (pb signalé par Patrice Raynaud et Isabelle Perucho)
- Un nouveau thème "AccordionCloud" est disponible (Wahid Mendil) 
- Pour ajouter un nouveau thème à partir d'un existant, il suffit de dupliquer 
un thème dans le répertoire iaConvert/themes
- Les chemins utilisés sont désormais persistants
- Ajout de la notion de puce: Par convention, une image définie avec un fond 
blanc est considérée comme une puce. De plus, un détourage sur fond blanc 
devient persistant. (signalé par Marie Persiaux)
- Les images liées ou incorporées dans InkScape sont traitées de la même 
façon (pb signalé par Isabelle Perucho sur MAC OS X 10.6)
- Un splash screen s'affiche durant la génération (feature demandée par 
Louis-Maurice De Sousa)
- Réglage d'un problème de zindex sur les détails (pb signalé par 
Isabelle Perucho)
- expérimental : ajout du fullscreen en cliquant sur le titre d'une image active
- Effet de zoom optimisé pour éviter le memory leaking sur Firefox et Iceweasel
- Prise en compte des images dans les descriptions (demandé par Aurélie Chauvet)
- Prise en compte des iframes dans les descriptions (demandé par Marie 
Persiaux pour vidéos youtube - fonctionne aussi avec les vidéos de la scolawebtv)
- Prise en compte des liens wiki de la forme [http(s)://link key_word] 
(demandé par Serge Raynaud)