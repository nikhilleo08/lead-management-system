# Lead Management App

## Features

- **Express** for robust server-side application development.
- **TypeScript** for static typing and developer-friendly tooling.
- **Prisma ORM** for seamless database management and migrations.
- **Environment Configurations** using `.env` files.
- **AWS Copilot** for automated infrastructure deployment for AWS ECS (Fargate).
- Authentication with **Google OAuth** and **JWT**.
- **Scheduler Support** with AWS EventBridge Scheduler.

---

## Getting Started

### Prerequisites

1. **Node.js** v18 or higher
2. **PostgreSQL**
3. **AWS CLI**
4. **AWS Copilot CLI**
5. **Docker**
5. **yarn**
5. **prisma**

---

### Installation

1. Clone the repository:

   ```bash
   git clone <repository_url>
   cd lead-management-app
   ```

2. Install dependencies:

   ```bash
   yarn install
   ```

3. Set up environment variables:

   - Copy `.env.example` to `.env`:

     ```bash
     cp .env.example .env
     ```

   - Add your configurations in the `.env` file.

4. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

5. Run database migrations:

   ```bash
   npx prisma migrate dev
   ```

6. Start the development server:

   ```bash
   npm run start
   ```

---

### Scripts

- **Development**: `npm run start:dev` – Starts the server in development mode.
- **Build**: `npm run build` – Compiles TypeScript to JavaScript.
---

## Environment Variables

Ensure the following variables are configured in your `.env` file:

```env
# API Configuration
API_PORT=3000

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret

# Encryption Key
ENCRYPTION_KEY=your-encryption-key

# Scheduler Configuration
CRON_SCHEDUER_PATTERN=0 * * * *
```

---

## Project Structure

```plaintext
├── src
│   ├── controllers   # Route controllers
│   ├── middleware    # Express middleware
│   ├── routes        # API route definitions
│   ├── services      # Business logic
│   ├── utils         # Utility functions
│   ├── index.ts      # Entry point
│
├── prisma
│   ├── schema.prisma # Database schema definition
│
├── .env.example      # Example environment variables
├── package.json      # Project metadata
```

---

## Deployment with AWS Copilot

### Prerequisites

1. Install **AWS CLI** and configure it with your AWS credentials:

   ```bash
   aws configure
   ```

2. Install **AWS Copilot CLI**:
   ```bash
   brew install aws/tap/copilot-cli
   ```
   ```bash
   brew install aws/tap/copilot-cli
   ```

3. Install **Terraform and CDKTF**:
   !["Terraform and CDKFTF"](https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli)
---

### Steps to Deploy

1. Initialize the Copilot application:

   ```bash
   copilot init
   ```

   - Follow the prompts to:
     - Select the service type (e.g., "Load Balanced Web Service").
     - Name your service.
     - Specify the Dockerfile location (default: `./Dockerfile`).

2. Deploy the infrastructure:

   ```bash
   copilot svc deploy --name <service-name> --env <environment-name>
   ```

   Example:
   ```bash
   copilot svc deploy --name api --env production
   ```

3. Check the deployment status:

   ```bash
   copilot svc show --name <service-name>
   ```

4. View logs:

   ```bash
   copilot svc logs --name <service-name>
   ```

---

### AWS Copilot Folder Structure

Once initialized, Copilot creates a `.copilot` directory:

```plaintext
.copilot
├── environments
│   └── <environment-name>
├── manifests
│   └── <service-name>.manifest.yml  # Service configuration
```

---


## **EC2 to RDS for Prisma Migrations**

This guide explains how to connect an EC2 instance to an RDS database to perform Prisma migrations. It also discusses the benefits of this approach, potential automation strategies, and best practices.

---

### **Steps to Connect EC2 to RDS and Perform Migrations**

#### 1. **Set Up an RDS Instance**
- Create an Amazon RDS database instance (PostgreSQL, MySQL, etc.).
- Configure the following:
  - **VPC:** Ensure the RDS instance is in a private subnet for security.
  - **Security Group:** Allow inbound traffic on the database port (e.g., `5432` for PostgreSQL) from your EC2 instance's security group.

#### 2. **Launch an EC2 Instance**
- Spin up an EC2 instance in the same VPC as the RDS instance.
- Assign a security group to the EC2 instance that allows outbound traffic to the RDS security group on the database port.

#### 3. **Install Required Tools on the EC2 Instance**
1. **SSH into your EC2 instance:**
   ```bash
   ssh -i your-key.pem ec2-user@your-ec2-ip
   ```

#### 4. **Install Node.js and npm**:
```bash
   curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
   sudo yum install -y nodejs
```

#### 4. **Install Prisma CLI globally:**:
```bash
   npm install -g prisma
```

#### 5. **Connect to RDS from EC2**:
Ensure the .env file on your EC2 instance has the correct DATABASE_URL pointing to your RDS instance:
```bash
   DATABASE_URL=postgresql://user:password@your-rds-endpoint:5432/dbname
```

#### 6. **Test the connection using Prisma**:
```bash
prisma db pull
```

#### 7. Run Migrations
Execute the Prisma migration commands:
```bash
   prisma migrate dev
   prisma migrate deploy
```

### Why It’s a Good Practice
#### 1. Security
- RDS in a private subnet prevents external access.
- EC2 in the same VPC ensures secure, low-latency access without exposing the database to the internet.
#### 2. Environment Control
- All migrations and database schema updates occur within a controlled AWS environment, ensuring consistency.
#### 3. Reduced Latency
- EC2 and RDS in the same VPC ensure faster communication during migration operations.
#### 4. Scalability
- Using AWS resources ensures the setup is scalable and can adapt to increased workloads or additional environments.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.
