.PHONY: clean-node-modules clean-dist clean-all

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

# Clean both node_modules and dist directories
clean-all: clean-node-modules clean-dist
	@echo "$(GREEN)✓ Cleaned all node_modules and dist directories$(NC)"
