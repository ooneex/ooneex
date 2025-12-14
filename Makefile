.PHONY: clean-node-modules clean-dist clean-pnpm-lock clean-all

# Clean node_modules directories
clean-node-modules:
	@echo "$(YELLOW)Finding and removing node_modules directories...$(NC)"
	@found_dirs=$$(find . -name "node_modules" -type d -not -path "*/.nx/*" 2>/dev/null || true); \
	if [ -n "$$found_dirs" ]; then \
		echo "$$found_dirs" | while read -r dir; do \
			if [ -d "$$dir" ]; then \
				echo "$(YELLOW)Removing $$dir$(NC)"; \
				rm -rf "$$dir"; \
				echo "$(GREEN)✓ Removed $$dir$(NC)"; \
			fi \
		done; \
		count=$$(echo "$$found_dirs" | wc -l | tr -d ' '); \
		echo "$(GREEN)✓ Removed $$count node_modules directories$(NC)"; \
	else \
		echo "$(YELLOW)No node_modules directories found$(NC)"; \
	fi

# Clean dist directories
clean-dist:
	@echo "$(YELLOW)Finding and removing dist directories...$(NC)"
	@found_dirs=$$(find . -name "dist" -type d -not -path "*/.nx/*" 2>/dev/null || true); \
	if [ -n "$$found_dirs" ]; then \
		echo "$$found_dirs" | while read -r dir; do \
			if [ -d "$$dir" ]; then \
				echo "$(YELLOW)Removing $$dir$(NC)"; \
				rm -rf "$$dir"; \
				echo "$(GREEN)✓ Removed $$dir$(NC)"; \
			fi \
		done; \
		count=$$(echo "$$found_dirs" | wc -l | tr -d ' '); \
		echo "$(GREEN)✓ Removed $$count dist directories$(NC)"; \
	else \
		echo "$(YELLOW)No dist directories found$(NC)"; \
	fi

# Clean pnpm-lock.yaml files
clean-pnpm-lock:
	@echo "$(YELLOW)Finding and removing pnpm-lock.yaml files...$(NC)"
	@found_files=$$(find . -name "pnpm-lock.yaml" -type f -not -path "*/.nx/*" 2>/dev/null || true); \
	if [ -n "$$found_files" ]; then \
		echo "$$found_files" | while read -r file; do \
			if [ -f "$$file" ]; then \
				echo "$(YELLOW)Removing $$file$(NC)"; \
				rm -f "$$file"; \
				echo "$(GREEN)✓ Removed $$file$(NC)"; \
			fi \
		done; \
		count=$$(echo "$$found_files" | wc -l | tr -d ' '); \
		echo "$(GREEN)✓ Removed $$count pnpm-lock.yaml files$(NC)"; \
	else \
		echo "$(YELLOW)No pnpm-lock.yaml files found$(NC)"; \
	fi

# Clean node_modules, dist directories, and pnpm-lock.yaml files
clean-all: clean-node-modules clean-dist clean-pnpm-lock
	@echo "$(GREEN)✓ Cleaned all node_modules, dist directories, and pnpm-lock.yaml files$(NC)"


publish:
	@echo "$(YELLOW)Publishing packages...$(NC)"
	@for package in $(shell find . -maxdepth 2 -type d -name "package.json" -not -path "*/.nx/*" -not -path "*/dist/*" -not -path "*/node_modules/*"); do \
		cd $$(dirname $$package); \
		echo "$(YELLOW)Publishing $$package$(NC)"; \
		bun publish ./dist --tolerate-republish --access public; \
		echo "$(GREEN)✓ Published $$package$(NC)"; \
	done

publish.dry:
	@echo "$(YELLOW)Publishing packages in dry-run mode...$(NC)"
	echo "$(YELLOW)Publishing analytics$(NC)"; \
	# bun publish ./packages/analytics/dist/ooneex-analytics-0.0.1.tgz --dry-run; \
	cd ./packages/analytics/dist && bun pm pack --destination ./dist --filename my-package.tgz; \
	echo "$(GREEN)✓ Published $$package$(NC)"; \
