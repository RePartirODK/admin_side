# CORRECTION BACKEND - Endpoints manquants

## Date: 02/11/2025

## Problèmes identifiés

Quand un compte entreprise est créé depuis l'interface mobile Flutter :
1. **Pas de notification** : L'admin n'est pas notifié de la création du compte
2. **Endpoints non trouvés** : Les endpoints suivants retournent `No static resource` :
   - `/api/notifications/admin/non-lues`
   - `/api/entreprises`
   - `/api/jeunes`
   - `/administrateurs/statistiques/dashboard`

## Analyse des erreurs

Les erreurs `NoResourceFoundException: No static resource` indiquent que Spring Boot traite ces requêtes comme des ressources statiques au lieu de les router vers les contrôleurs. Cela peut être dû à :
1. Les contrôleurs ne sont pas correctement mappés
2. La configuration Spring Security bloque ces endpoints
3. L'ordre de mapping des handlers dans Spring est incorrect

## Solutions à implémenter

### 1. Endpoint des notifications - GET /api/notifications/admin/non-lues

**Fichier**: `NotificationController.java`

Assurez-vous que le contrôleur est annoté ainsi :

```java
@RestController
@RequestMapping("/api/notifications/admin")
@PreAuthorize("hasRole('ADMIN')")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @GetMapping("/non-lues")
    public ResponseEntity<List<NotificationResponseDto>> getNonLues(
        Authentication authentication
    ) {
        try {
            // Récupérer l'email de l'admin connecté
            String adminEmail = authentication.getName();
            
            // Filtrer les notifications pour cet admin uniquement
            List<NotificationResponseDto> notifications = 
                notificationService.getNonLues(adminEmail);
            
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping("/{id}/marquer-comme-lue")
    public ResponseEntity<Void> marquerCommeLue(
        @PathVariable Long id,
        Authentication authentication
    ) {
        try {
            String adminEmail = authentication.getName();
            notificationService.marquerCommeLue(id, adminEmail);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

**IMPORTANT**: Filtrer les notifications par l'email de l'admin connecté dans `NotificationService.getNonLues()` pour éviter que les notifications d'un admin apparaissent chez un autre.

### 2. Endpoint des entreprises - GET /api/entreprises

**Fichier**: `EntrepriseController.java` ou similaire

Assurez-vous que le contrôleur existe et est correctement mappé :

```java
@RestController
@RequestMapping("/api/entreprises")
@PreAuthorize("hasRole('ADMIN')")
public class EntrepriseController {
    
    @Autowired
    private EntrepriseService entrepriseService;
    
    @GetMapping
    public ResponseEntity<List<EntrepriseResponseDto>> getAllEntreprises() {
        try {
            List<EntrepriseResponseDto> entreprises = entrepriseService.getAll();
            return ResponseEntity.ok(entreprises);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

### 3. Endpoint des jeunes - GET /api/jeunes

**Fichier**: `JeuneController.java` ou similaire

Assurez-vous que le contrôleur existe et est correctement mappé :

```java
@RestController
@RequestMapping("/api/jeunes")
@PreAuthorize("hasRole('ADMIN')")
public class JeuneController {
    
    @Autowired
    private JeuneService jeuneService;
    
    @GetMapping
    public ResponseEntity<List<JeuneResponseDto>> getAllJeunes() {
        try {
            List<JeuneResponseDto> jeunes = jeuneService.getAll();
            return ResponseEntity.ok(jeunes);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

### 4. Endpoint des statistiques - GET /administrateurs/statistiques/dashboard

**Fichier**: `AdminController.java` ou `StatisticsController.java`

Assurez-vous que le contrôleur existe et est correctement mappé :

```java
@RestController
@RequestMapping("/administrateurs/statistiques")
@PreAuthorize("hasRole('ADMIN')")
public class StatisticsController {
    
    @Autowired
    private StatisticsService statisticsService;
    
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStatisticsDto> getDashboardStatistics() {
        try {
            DashboardStatisticsDto stats = statisticsService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
```

### 5. Configuration Spring Security

**Fichier**: `SecurityConfig.java` ou `WebSecurityConfig.java`

Assurez-vous que les endpoints API sont autorisés :

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/notifications/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/entreprises/**").hasRole("ADMIN")
                .requestMatchers("/api/jeunes/**").hasRole("ADMIN")
                .requestMatchers("/administrateurs/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .sessionManagement(session -> 
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        
        return http.build();
    }
}
```

### 6. Notification lors de la création d'un compte entreprise

**Fichier**: Service qui crée les entreprises (probablement `EntrepriseService.java`)

Quand un compte entreprise est créé depuis l'interface mobile, assurez-vous de créer une notification pour TOUS les admins :

```java
@Service
@Transactional
public class EntrepriseService {
    
    @Autowired
    private EntrepriseRepository entrepriseRepository;
    
    @Autowired
    private UtilisateurRepository utilisateurRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private AdminRepository adminRepository;
    
    public Entreprise creerEntreprise(CreerEntrepriseDto dto) {
        // Créer l'utilisateur et l'entreprise
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setEmail(dto.getEmail());
        utilisateur.setNom(dto.getNom());
        utilisateur.setRole(Role.ENTREPRISE);
        utilisateur.setEtat(Etat.EN_ATTENTE);
        utilisateur = utilisateurRepository.save(utilisateur);
        
        Entreprise entreprise = new Entreprise();
        entreprise.setUtilisateur(utilisateur);
        entreprise = entrepriseRepository.save(entreprise);
        
        // Créer une notification pour CHAQUE admin
        List<Admin> admins = adminRepository.findAll();
        for (Admin admin : admins) {
            Notification notification = new Notification();
            notification.setAdmin(admin);
            notification.setUtilisateur(utilisateur);
            notification.setMessage(
                String.format("Nouveau compte entreprise '%s' en attente de validation", 
                    utilisateur.getNom())
            );
            notification.setLue(false);
            notification.setDateCreation(LocalDateTime.now());
            notificationService.save(notification);
            
            // Envoyer via WebSocket si l'admin est connecté (optionnel)
            try {
                messagingTemplate.convertAndSendToUser(
                    admin.getEmail(),
                    "/queue/notifications",
                    notificationMapper.toDto(notification)
                );
            } catch (Exception e) {
                // Si l'admin n'est pas connecté, ignorer l'erreur WebSocket
                // La notification sera quand même enregistrée en base
            }
        }
        
        return entreprise;
    }
}
```

**Note**: Les warnings WebSocket `No active sessions` sont normaux si l'admin n'est pas connecté au moment de la création. Les notifications seront quand même visibles quand l'admin se connectera.

## Points à vérifier

1. ✅ Tous les contrôleurs doivent avoir `@RestController` et `@RequestMapping`
2. ✅ Les endpoints doivent être autorisés dans `SecurityConfig`
3. ✅ Les notifications doivent être filtrées par l'admin connecté dans `getNonLues()`
4. ✅ Quand un compte est créé, une notification doit être créée pour TOUS les admins
5. ✅ Les DTOs de réponse doivent inclure tous les champs nécessaires (id, message, lue, dateCreation)

## Tests à effectuer

1. Créer un compte entreprise depuis l'interface mobile
2. Vérifier qu'une notification est créée en base pour chaque admin
3. Se connecter en tant qu'admin et vérifier que la notification apparaît
4. Vérifier que les endpoints `/api/entreprises`, `/api/jeunes`, `/api/notifications/admin/non-lues` retournent des données
5. Vérifier que `/administrateurs/statistiques/dashboard` retourne les statistiques

