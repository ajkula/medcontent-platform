import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  // Vérifier si un utilisateur admin existe déjà
  const adminExists = await prisma.user.findFirst({
    where: {
      role: UserRole.ADMIN,
    },
  });

  if (!adminExists) {
    // Créer un utilisateur admin
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: 'admin@example.com',
        passwordHash: hashedPassword,
        role: UserRole.ADMIN,
      },
    });
    
    console.log(`Utilisateur administrateur créé avec l'ID: ${admin.id}`);
  } else {
    console.log('Un utilisateur administrateur existe déjà');
  }

  // Créer quelques catégories de base si elles n'existent pas
  const baseCategories = [
    { name: 'Cardiologie', description: 'Articles liés aux maladies cardiaques et traitements' },
    { name: 'Neurologie', description: 'Études et recherches sur le système nerveux' },
    { name: 'Oncologie', description: 'Recherches et traitements contre le cancer' },
    { name: 'Maladies infectieuses', description: 'Informations sur les maladies infectieuses et la virologie' },
    { name: 'Immunologie', description: 'Études sur le système immunitaire' },
  ];

  for (const cat of baseCategories) {
    const exists = await prisma.category.findFirst({
      where: {
        name: cat.name,
      },
    });

    if (!exists) {
      await prisma.category.create({
        data: cat,
      });
      console.log(`Catégorie '${cat.name}' créée`);
    }
  }

  console.log('Données initiales créées avec succès');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });