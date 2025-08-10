/**
 * @fileoverview Project operations for the MCP Kanban server
 *
 * This module provides functions for interacting with projects in the Planka Kanban system,
 * including creating, retrieving, updating, and deleting projects.
 */

import { z } from "zod";
import { plankaRequest } from "../common/utils.js";
import { PlankaProjectSchema } from "../common/types.js";

// Schema definitions
/**
 * Schema for creating a new project
 * @property {string} name - The name of the project
 */
export const CreateProjectSchema = z.object({
    name: z.string().describe("Project name"),
    description: z.string().optional().describe("Project description"),
});

/**
 * Schema for retrieving projects with pagination
 * @property {number} [page] - Page number for pagination (default: 1)
 * @property {number} [perPage] - Number of results per page (default: 30, max: 100)
 */
export const GetProjectsSchema = z.object({});

/**
 * Schema for retrieving a specific project
 * @property {string} id - The ID of the project to retrieve
 */
export const GetProjectSchema = z.object({
    id: z.string().describe("Project ID"),
});

/**
 * Schema for updating a project
 * @property {string} id - The ID of the project to update
 * @property {string} [name] - The new name for the project
 */
export const UpdateProjectSchema = z.object({
    id: z.string().describe("Project ID"),
    name: z.string().optional().describe("Project name"),
    description: z.string().optional().describe("Project description"),
    backgroundType: z.string().optional().describe("Background type"),
    backgroundGradient: z.string().optional().describe("Background gradient"),
    backgroundImageId: z.string().optional().describe("Background image ID"),
    isHidden: z.boolean().optional().describe("Whether the project is hidden"),
});

/**
 * Schema for deleting a project
 * @property {string} id - The ID of the project to delete
 */
export const DeleteProjectSchema = z.object({
    id: z.string().describe("Project ID"),
});

// Type exports
/**
 * Type definition for project creation options
 */
export type CreateProjectOptions = z.infer<typeof CreateProjectSchema>;

/**
 * Type definition for project update options
 */
export type UpdateProjectOptions = z.infer<typeof UpdateProjectSchema>;

// Response schemas
const ProjectsResponseSchema = z.object({
    items: z.array(PlankaProjectSchema),
    included: z.record(z.any()).optional(),
});

const ProjectResponseSchema = z.object({
    item: PlankaProjectSchema,
    included: z.record(z.any()).optional(),
});

/**
 * Retrieves projects with pagination support
 *
 * @param {number} [page=1] - The page number to retrieve (1-indexed)
 * @param {number} [perPage=30] - The number of projects per page (max: 100)
 * @returns {Promise<{items: Array<object>, included?: object}>} Paginated projects
 * @throws {Error} If retrieving projects fails
 */
export async function getProjects() {
    try {
        const response = await plankaRequest(`/api/projects`, {
            method: "GET",
        });

        const parsedResponse = ProjectsResponseSchema.parse(response);
        return parsedResponse;
    } catch (error) {
        throw new Error(
            `Failed to get projects: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
}

export async function updateProject(
    id: string,
    options: Partial<Omit<UpdateProjectOptions, "id">>,
) {
    const response = await plankaRequest(`/api/projects/${id}`, {
        method: "PATCH",
        body: options,
    });
    const parsedResponse = ProjectResponseSchema.parse(response);
    return parsedResponse.item;
}

export async function deleteProject(id: string) {
    await plankaRequest(`/api/projects/${id}`, {
        method: "DELETE",
    });
    return { success: true };
}

/**
 * Retrieves a specific project by ID
 *
 * @param {string} id - The ID of the project to retrieve
 * @returns {Promise<object>} The requested project
 * @throws {Error} If retrieving the project fails
 */
export async function createProject(options: CreateProjectOptions) {
    try {
        const response = await plankaRequest(`/api/projects`, {
            method: "POST",
            body: {
                name: options.name,
                description: options.description,
            },
        });
        const parsedResponse = ProjectResponseSchema.parse(response);
        return parsedResponse.item;
    } catch (error) {
        throw new Error(
            `Failed to create project: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
}

export async function getProject(id: string) {
    try {
        const response = await plankaRequest(`/api/projects/${id}`);
        const parsedResponse = ProjectResponseSchema.parse(response);
        return parsedResponse.item;
    } catch (error) {
        throw new Error(
            `Failed to get project: ${
                error instanceof Error ? error.message : String(error)
            }`,
        );
    }
}
